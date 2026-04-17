---
title: "TP9 - LDS2: Qt GUI Programming (PyQt5)"
sidebar_position: 7
---

# TP9 - LDS2: Qt GUI Programming (PyQt5)

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp9_qt_gui/README.md

## Exercise 1

### Create a basic window with widgets and layouts: QMainWindow, QLabel, QPushButton, QLineEdit, layouts, and window properties (title, size)

**Answer:**

```python
import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QHBoxLayout, QPushButton, QLabel, QLineEdit
)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Exercise 1 - Simple Window")
        self.setGeometry(100, 100, 400, 300)

        # Central widget and layout
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Widgets
        self.label = QLabel("Enter your name:")
        self.input = QLineEdit()
        self.input.setPlaceholderText("Name...")

        # Horizontal button row
        button_row = QHBoxLayout()
        self.greet_btn = QPushButton("Greet")
        self.clear_btn = QPushButton("Clear")
        button_row.addWidget(self.greet_btn)
        button_row.addWidget(self.clear_btn)

        self.result = QLabel("")

        # Add to layout
        layout.addWidget(self.label)
        layout.addWidget(self.input)
        layout.addLayout(button_row)
        layout.addWidget(self.result)

        # Connect signals to slots
        self.greet_btn.clicked.connect(self.greet)
        self.clear_btn.clicked.connect(self.clear)
        self.input.returnPressed.connect(self.greet)

    def greet(self):
        name = self.input.text()
        if name:
            self.result.setText(f"Hello, {name}!")
        else:
            self.result.setText("Please enter a name.")

    def clear(self):
        self.input.clear()
        self.result.clear()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
```

**Expected behavior:**
- Initial: label "Enter your name:", empty text field, two buttons, empty result
- Type "Alice" and click Greet: result shows "Hello, Alice!"
- Click Clear: fields reset
- Click Greet with empty field: "Please enter a name."

**Key concepts:**

| Concept | Code | Purpose |
|---------|------|---------|
| `QMainWindow` | `class MainWindow(QMainWindow)` | Top-level window |
| `setCentralWidget()` | `self.setCentralWidget(central)` | Main content area |
| `QVBoxLayout` | `QVBoxLayout(central)` | Stack widgets vertically |
| `QHBoxLayout` | `QHBoxLayout()` | Place widgets horizontally |
| Signal/Slot | `btn.clicked.connect(self.greet)` | Event handling |
| `returnPressed` | `input.returnPressed.connect(...)` | Enter key in QLineEdit |

---

## Exercise 2

### Build an image viewer application: load and display images, zoom in/out, navigate between images, image transformations (tp6-p2_e.py)

**Answer:**

```python
import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QLabel, QFileDialog,
    QVBoxLayout, QHBoxLayout, QWidget, QPushButton, QScrollArea
)
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtCore import Qt


class ImageViewer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Image Viewer")
        self.setGeometry(100, 100, 800, 600)
        self.scale_factor = 1.0
        self.init_ui()

    def init_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Toolbar
        toolbar = QHBoxLayout()
        open_btn = QPushButton("Open")
        zoom_in_btn = QPushButton("Zoom +")
        zoom_out_btn = QPushButton("Zoom -")
        fit_btn = QPushButton("Fit")
        toolbar.addWidget(open_btn)
        toolbar.addWidget(zoom_in_btn)
        toolbar.addWidget(zoom_out_btn)
        toolbar.addWidget(fit_btn)

        # Scrollable image area
        self.scroll_area = QScrollArea()
        self.image_label = QLabel()
        self.image_label.setAlignment(Qt.AlignCenter)
        self.scroll_area.setWidget(self.image_label)
        self.scroll_area.setWidgetResizable(False)

        layout.addLayout(toolbar)
        layout.addWidget(self.scroll_area)

        # Connect signals
        open_btn.clicked.connect(self.open_image)
        zoom_in_btn.clicked.connect(self.zoom_in)
        zoom_out_btn.clicked.connect(self.zoom_out)
        fit_btn.clicked.connect(self.fit_to_window)

    def open_image(self):
        filename, _ = QFileDialog.getOpenFileName(
            self, "Open Image", "",
            "Images (*.png *.jpg *.bmp *.gif);;All Files (*)"
        )
        if filename:
            self.image = QImage(filename)
            self.scale_factor = 1.0
            self.update_display()
            self.setWindowTitle(f"Image Viewer - {filename}")

    def update_display(self):
        if hasattr(self, "image"):
            scaled = self.image.scaled(
                int(self.image.width() * self.scale_factor),
                int(self.image.height() * self.scale_factor),
                Qt.KeepAspectRatio,
            )
            self.image_label.setPixmap(QPixmap.fromImage(scaled))
            self.image_label.adjustSize()

    def zoom_in(self):
        self.scale_factor *= 1.25
        self.update_display()

    def zoom_out(self):
        self.scale_factor *= 0.8
        self.update_display()

    def fit_to_window(self):
        if hasattr(self, "image"):
            w_ratio = self.scroll_area.width() / self.image.width()
            h_ratio = self.scroll_area.height() / self.image.height()
            self.scale_factor = min(w_ratio, h_ratio)
            self.update_display()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ImageViewer()
    window.show()
    sys.exit(app.exec_())
```

**Expected behavior:**
1. Initial: empty window with toolbar buttons
2. Open: image displayed at 100%, title shows filename
3. Zoom +: image 125% per click, scrollbars appear if needed
4. Zoom -: image shrinks 80% per click
5. Fit: image scales to fit scroll area

---

## Exercise 3

### Create an analog clock widget using QPainter for custom drawing and QTimer for periodic updates (Horloge_e.py)

**Answer:**

```python
import sys
from PyQt5.QtWidgets import QApplication, QWidget
from PyQt5.QtGui import QPainter, QPen
from PyQt5.QtCore import QTimer, Qt, QTime


class ClockWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Analog Clock")
        self.setMinimumSize(300, 300)
        timer = QTimer(self)
        timer.timeout.connect(self.update)  # Triggers paintEvent
        timer.start(1000)                   # Every second

    def paintEvent(self, event):
        """Called automatically when widget needs redrawing."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        side = min(self.width(), self.height())
        painter.translate(self.width() / 2, self.height() / 2)
        painter.scale(side / 200, side / 200)

        now = QTime.currentTime()

        # Clock face
        painter.setPen(QPen(Qt.black, 2))
        painter.drawEllipse(-90, -90, 180, 180)

        # Hour marks
        for i in range(12):
            painter.save()
            painter.rotate(i * 30)       # 360/12 = 30 degrees
            painter.drawLine(0, -85, 0, -75)
            painter.restore()

        # Minute marks
        painter.setPen(QPen(Qt.gray, 1))
        for i in range(60):
            if i % 5 != 0:
                painter.save()
                painter.rotate(i * 6)    # 360/60 = 6 degrees
                painter.drawLine(0, -85, 0, -80)
                painter.restore()

        # Hour hand
        painter.save()
        hour_angle = 30 * (now.hour() % 12) + now.minute() * 0.5
        painter.rotate(hour_angle)
        painter.setPen(QPen(Qt.black, 4))
        painter.drawLine(0, 5, 0, -50)
        painter.restore()

        # Minute hand
        painter.save()
        painter.rotate(6 * now.minute() + now.second() * 0.1)
        painter.setPen(QPen(Qt.blue, 2))
        painter.drawLine(0, 5, 0, -70)
        painter.restore()

        # Second hand
        painter.save()
        painter.rotate(6 * now.second())
        painter.setPen(QPen(Qt.red, 1))
        painter.drawLine(0, 10, 0, -80)
        painter.restore()

        # Center dot
        painter.setPen(Qt.NoPen)
        painter.setBrush(Qt.red)
        painter.drawEllipse(-3, -3, 6, 6)

        painter.end()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    clock = ClockWidget()
    clock.resize(400, 400)
    clock.show()
    sys.exit(app.exec_())
```

**Key QPainter concepts:**

| Method | Purpose |
|--------|---------|
| `painter.translate(cx, cy)` | Move origin to center |
| `painter.scale(sx, sy)` | Scale coordinate system |
| `painter.rotate(degrees)` | Rotate coordinate system |
| `painter.save()` / `restore()` | Save/restore transform state |
| `painter.drawLine(x1, y1, x2, y2)` | Draw a line |
| `painter.drawEllipse(x, y, w, h)` | Draw ellipse/circle |

---

## Exercise 4

### Multi-document interface (MDI) for editing images with RGB color adjustment, true color vs indexed color, window management (fenetreMDI_e.py, principalMDI_e.py)

**Answer:**

```python
import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QMdiArea, QMdiSubWindow,
    QLabel, QFileDialog, QAction, QWidget, QVBoxLayout,
    QHBoxLayout, QSlider
)
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtCore import Qt


class ImageWidget(QWidget):
    """Widget displaying an image with RGB sliders."""

    def __init__(self, filename):
        super().__init__()
        self.original_image = QImage(filename)
        self.current_image = QImage(self.original_image)

        layout = QVBoxLayout(self)

        # Image display
        self.image_label = QLabel()
        self.image_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.image_label)

        # RGB sliders
        for channel, color in [("R", "red"), ("G", "green"), ("B", "blue")]:
            row = QHBoxLayout()
            label = QLabel(f"{channel}:")
            slider = QSlider(Qt.Horizontal)
            slider.setRange(0, 200)
            slider.setValue(100)
            slider.valueChanged.connect(self.update_image)
            setattr(self, f"slider_{color}", slider)
            row.addWidget(label)
            row.addWidget(slider)
            layout.addLayout(row)

        self.update_display()

    def update_image(self):
        """Apply RGB adjustments to original image."""
        r_factor = self.slider_red.value() / 100.0
        g_factor = self.slider_green.value() / 100.0
        b_factor = self.slider_blue.value() / 100.0

        self.current_image = QImage(self.original_image)
        for x in range(self.current_image.width()):
            for y in range(self.current_image.height()):
                rgb = self.current_image.pixel(x, y)
                r = min(255, int(((rgb >> 16) & 0xFF) * r_factor))
                g = min(255, int(((rgb >> 8) & 0xFF) * g_factor))
                b = min(255, int((rgb & 0xFF) * b_factor))
                self.current_image.setPixel(
                    x, y, (0xFF << 24) | (r << 16) | (g << 8) | b
                )
        self.update_display()

    def update_display(self):
        pixmap = QPixmap.fromImage(self.current_image)
        self.image_label.setPixmap(pixmap)


class MDIImageEditor(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("MDI Image Editor")
        self.setGeometry(100, 100, 1000, 700)

        self.mdi = QMdiArea()
        self.setCentralWidget(self.mdi)
        self.create_menus()

    def create_menus(self):
        menubar = self.menuBar()

        file_menu = menubar.addMenu("File")
        open_action = QAction("Open Image", self)
        open_action.triggered.connect(self.open_image)
        file_menu.addAction(open_action)

        window_menu = menubar.addMenu("Window")
        cascade_action = QAction("Cascade", self)
        cascade_action.triggered.connect(self.mdi.cascadeSubWindows)
        tile_action = QAction("Tile", self)
        tile_action.triggered.connect(self.mdi.tileSubWindows)
        window_menu.addAction(cascade_action)
        window_menu.addAction(tile_action)

    def open_image(self):
        filename, _ = QFileDialog.getOpenFileName(
            self, "Open Image", "",
            "Images (*.png *.jpg *.bmp);;All Files (*)"
        )
        if filename:
            image_widget = ImageWidget(filename)
            sub = QMdiSubWindow()
            sub.setWidget(image_widget)
            sub.setWindowTitle(filename.split("/")[-1])
            self.mdi.addSubWindow(sub)
            sub.show()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MDIImageEditor()
    window.show()
    sys.exit(app.exec_())
```

**RGB pixel manipulation:**

```python
# Extract channels from 32-bit ARGB pixel
rgb = image.pixel(x, y)     # Returns 0xAARRGGBB
r = (rgb >> 16) & 0xFF      # Shift right 16, mask 8 bits
g = (rgb >> 8) & 0xFF
b = rgb & 0xFF

# Reconstruct pixel after modification
new_pixel = (0xFF << 24) | (r << 16) | (g << 8) | b
image.setPixel(x, y, new_pixel)
```

**Expected behavior:**
1. Initial: menu bar (File, Window), empty MDI area
2. File > Open Image: sub-window with image and R/G/B sliders at 100%
3. Move R slider to 200: image appears more reddish
4. Move G slider to 0: green removed (purple/magenta tones)
5. Open second image: two sub-windows
6. Window > Tile: side-by-side layout
7. Window > Cascade: overlapping layout
