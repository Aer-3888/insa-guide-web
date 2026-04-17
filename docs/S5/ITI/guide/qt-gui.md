---
title: "Qt GUI Programming"
sidebar_position: 6
---

# Qt GUI Programming

## Overview

Qt is a cross-platform GUI framework. The LDS course uses PyQt5 (Python bindings for Qt) to build graphical applications. Key concepts include widgets, layouts, signals/slots (event handling), and image processing.

## PyQt5 Application Structure

### Minimal Application

```python
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel
import sys

app = QApplication(sys.argv)           # Create application
window = QMainWindow()                  # Create main window
window.setWindowTitle("My App")
window.setGeometry(100, 100, 800, 600) # x, y, width, height

label = QLabel("Hello, Qt!", window)
window.setCentralWidget(label)

window.show()
sys.exit(app.exec_())                   # Start event loop
```

### Event-Driven Programming

Qt applications are **event-driven**: the program waits for events (clicks, key presses, etc.) and responds through **signal-slot connections**.

```
User clicks button
    --> Button emits "clicked" signal
        --> Connected slot function executes
```

## Widgets

### Common Widgets

| Widget | Purpose | Key Properties |
|--------|---------|----------------|
| `QWidget` | Base class for all UI elements | parent, geometry |
| `QMainWindow` | Main window with menu/toolbar/status | centralWidget |
| `QLabel` | Display text or images | text, pixmap |
| `QPushButton` | Clickable button | text, clicked signal |
| `QLineEdit` | Single-line text input | text, textChanged signal |
| `QTextEdit` | Multi-line text editor | toPlainText(), setPlainText() |
| `QSpinBox` | Integer input with arrows | value, valueChanged signal |
| `QDoubleSpinBox` | Float input with arrows | value, decimals |
| `QSlider` | Slider control | value, valueChanged signal |
| `QComboBox` | Dropdown list | currentText, currentIndexChanged |
| `QCheckBox` | Toggle checkbox | isChecked, stateChanged |
| `QRadioButton` | Radio button (exclusive) | isChecked, toggled |
| `QProgressBar` | Progress indicator | setValue, minimum, maximum |

### Widget Examples

```python
from PyQt5.QtWidgets import (
    QPushButton, QLabel, QLineEdit, QSpinBox,
    QSlider, QComboBox, QCheckBox
)

# Button
button = QPushButton("Click Me")
button.setEnabled(True)
button.clicked.connect(on_click)

# Label
label = QLabel("Status: Ready")
label.setText("Updated text")

# Text input
text_input = QLineEdit()
text_input.setPlaceholderText("Enter name...")
text_input.textChanged.connect(on_text_change)
name = text_input.text()

# Spin box
spin = QSpinBox()
spin.setRange(0, 100)
spin.setValue(50)
spin.valueChanged.connect(on_value_change)

# Slider
slider = QSlider(Qt.Horizontal)
slider.setRange(0, 255)
slider.valueChanged.connect(on_slider_change)

# Combo box (dropdown)
combo = QComboBox()
combo.addItems(["Option A", "Option B", "Option C"])
combo.currentIndexChanged.connect(on_selection_change)

# Checkbox
checkbox = QCheckBox("Enable feature")
checkbox.stateChanged.connect(on_toggle)
```

## Layouts

Layouts automatically position widgets and handle window resizing.

### Layout Types

```python
from PyQt5.QtWidgets import (
    QVBoxLayout, QHBoxLayout, QGridLayout, QFormLayout, QWidget
)

# Vertical layout (stack top to bottom)
vlayout = QVBoxLayout()
vlayout.addWidget(widget1)
vlayout.addWidget(widget2)
vlayout.addWidget(widget3)

# Horizontal layout (left to right)
hlayout = QHBoxLayout()
hlayout.addWidget(widget1)
hlayout.addWidget(widget2)

# Grid layout (rows x columns)
grid = QGridLayout()
grid.addWidget(widget1, 0, 0)     # Row 0, Col 0
grid.addWidget(widget2, 0, 1)     # Row 0, Col 1
grid.addWidget(widget3, 1, 0, 1, 2)  # Row 1, Col 0, span 1 row x 2 cols

# Form layout (label + field pairs)
form = QFormLayout()
form.addRow("Name:", QLineEdit())
form.addRow("Age:", QSpinBox())

# Apply layout to container widget
container = QWidget()
container.setLayout(vlayout)
```

### Nesting Layouts

```python
# Main vertical layout with nested horizontal layouts
main_layout = QVBoxLayout()

# Top row (horizontal)
top_row = QHBoxLayout()
top_row.addWidget(QPushButton("A"))
top_row.addWidget(QPushButton("B"))

# Bottom row
bottom_row = QHBoxLayout()
bottom_row.addWidget(QPushButton("C"))
bottom_row.addWidget(QPushButton("D"))

main_layout.addLayout(top_row)
main_layout.addLayout(bottom_row)
```

## Signals and Slots

### Connecting Signals to Slots

```python
# Connect signal to function (slot)
button.clicked.connect(self.on_button_clicked)
slider.valueChanged.connect(self.on_slider_changed)
text_input.textChanged.connect(self.on_text_changed)

# Slot functions
def on_button_clicked(self):
    print("Button clicked!")

def on_slider_changed(self, value):
    self.label.setText(f"Value: {value}")

def on_text_changed(self, text):
    print(f"Text: {text}")
```

### Custom Signals

```python
from PyQt5.QtCore import pyqtSignal

class MyWidget(QWidget):
    # Define custom signal
    data_changed = pyqtSignal(str)
    
    def update_data(self, new_data):
        # Emit signal
        self.data_changed.emit(new_data)

# Connect custom signal
widget.data_changed.connect(handle_data_change)
```

## Image Processing

### Loading and Displaying Images

```python
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtWidgets import QLabel

# Load image
image = QImage("photo.jpg")

# Display in QLabel
pixmap = QPixmap.fromImage(image)
label = QLabel()
label.setPixmap(pixmap)

# Scaled display
scaled_pixmap = pixmap.scaled(400, 300, Qt.KeepAspectRatio)
label.setPixmap(scaled_pixmap)
```

### Pixel Manipulation

```python
# Access pixel color
# QImage.pixel() returns QRgb in 0xAARRGGBB format
rgb = image.pixel(x, y)
r = (rgb >> 16) & 0xFF
g = (rgb >> 8) & 0xFF
b = rgb & 0xFF

# Modify pixel
# Note: For Format_RGB32, alpha is ignored (always opaque).
# For Format_ARGB32, include alpha: (0xFF << 24) | (r << 16) | (g << 8) | b
new_rgb = (r << 16) | (g << 8) | b
image.setPixel(x, y, new_rgb)

# Grayscale conversion
for x in range(image.width()):
    for y in range(image.height()):
        rgb = image.pixel(x, y)
        r = (rgb >> 16) & 0xFF
        g = (rgb >> 8) & 0xFF
        b = rgb & 0xFF
        gray = int(0.299 * r + 0.587 * g + 0.114 * b)
        image.setPixel(x, y, (gray << 16) | (gray << 8) | gray)
```

### Image Properties

```python
width = image.width()
height = image.height()
depth = image.depth()              # Bits per pixel
format_type = image.format()       # QImage.Format_RGB32, etc.
```

## MDI (Multiple Document Interface)

```python
from PyQt5.QtWidgets import QMdiArea, QMdiSubWindow

# Create MDI area as central widget
mdi = QMdiArea()
main_window.setCentralWidget(mdi)

# Add sub-windows
sub = QMdiSubWindow()
sub.setWidget(some_widget)
mdi.addSubWindow(sub)
sub.show()

# Window management
mdi.cascadeSubWindows()
mdi.tileSubWindows()
```

## Menus and Toolbars

```python
# Menu bar
menubar = self.menuBar()
file_menu = menubar.addMenu("File")

# Actions
open_action = file_menu.addAction("Open")
open_action.setShortcut("Ctrl+O")
open_action.triggered.connect(self.open_file)

save_action = file_menu.addAction("Save")
save_action.setShortcut("Ctrl+S")
save_action.triggered.connect(self.save_file)

file_menu.addSeparator()
exit_action = file_menu.addAction("Exit")
exit_action.triggered.connect(self.close)

# Toolbar
toolbar = self.addToolBar("Main")
toolbar.addAction(open_action)
toolbar.addAction(save_action)
```

## Dialogs

```python
from PyQt5.QtWidgets import QFileDialog, QMessageBox, QInputDialog

# File open dialog
filename, _ = QFileDialog.getOpenFileName(
    self, "Open File", "", "Images (*.png *.jpg);;All Files (*)"
)

# File save dialog
filename, _ = QFileDialog.getSaveFileName(
    self, "Save File", "", "Text Files (*.txt)"
)

# Message box
QMessageBox.information(self, "Info", "Operation completed")
QMessageBox.warning(self, "Warning", "Check your input")
reply = QMessageBox.question(self, "Confirm", "Are you sure?")
if reply == QMessageBox.Yes:
    # proceed

# Input dialog
text, ok = QInputDialog.getText(self, "Input", "Enter name:")
number, ok = QInputDialog.getInt(self, "Input", "Enter age:", 18, 0, 120)
```

## Complete Application Template

```python
import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QPushButton, QLabel, QLineEdit
)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("My Application")
        self.setGeometry(100, 100, 600, 400)
        self.init_ui()
    
    def init_ui(self):
        # Central widget and layout
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        
        # Widgets
        self.label = QLabel("Enter your name:")
        self.input = QLineEdit()
        self.button = QPushButton("Greet")
        self.result = QLabel("")
        
        # Layout
        layout.addWidget(self.label)
        layout.addWidget(self.input)
        layout.addWidget(self.button)
        layout.addWidget(self.result)
        
        # Signals
        self.button.clicked.connect(self.greet)
        self.input.returnPressed.connect(self.greet)
    
    def greet(self):
        name = self.input.text()
        self.result.setText(f"Hello, {name}!")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
```

## QPainter (Custom Drawing)

```python
from PyQt5.QtGui import QPainter, QColor, QPen
from PyQt5.QtCore import Qt

class ClockWidget(QWidget):
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Draw shapes
        painter.setPen(QPen(Qt.black, 2))
        painter.drawLine(0, 0, 100, 100)
        painter.drawRect(10, 10, 80, 60)
        painter.drawEllipse(50, 50, 100, 100)
        
        # Fill
        painter.setBrush(QColor(255, 0, 0))    # Red fill
        painter.drawRect(20, 20, 50, 50)
        
        painter.end()
```

## QTimer

```python
from PyQt5.QtCore import QTimer

# Periodic timer
timer = QTimer()
timer.timeout.connect(self.update_display)
timer.start(1000)        # Every 1000ms

# Single shot
QTimer.singleShot(5000, self.delayed_action)
```

---

## CHEAT SHEET

### Application Structure
```python
app = QApplication(sys.argv)
window = QMainWindow()
window.show()
sys.exit(app.exec_())
```

### Common Widgets
```
QLabel, QPushButton, QLineEdit, QTextEdit
QSpinBox, QSlider, QComboBox, QCheckBox
QTableView, QListView, QTreeView
```

### Layouts
```
QVBoxLayout   Vertical stack
QHBoxLayout   Horizontal row
QGridLayout   Row x Column grid
QFormLayout   Label + Field pairs
```

### Signals/Slots
```python
widget.signal.connect(slot_function)
button.clicked.connect(self.on_click)
slider.valueChanged.connect(self.on_change)
```

### Image
```python
image = QImage("file.jpg")
pixmap = QPixmap.fromImage(image)
label.setPixmap(pixmap)
rgb = image.pixel(x, y)
```

### Dialogs
```python
QFileDialog.getOpenFileName(...)
QMessageBox.information(self, "Title", "Text")
QInputDialog.getText(self, "Title", "Prompt:")
```
