---
title: "LDS2 - Qt GUI Programming (PyQt)"
sidebar_position: 9
---

# LDS2 - Qt GUI Programming (PyQt)

## Learning Objectives

Introduction to GUI application development with Qt and Python:

- Understand event-driven programming
- Create GUI applications with PyQt
- Handle user interactions (signals and slots)
- Work with images and graphics
- Implement common UI patterns (MDI, dialogs, menus)

## Core Concepts

### 1. PyQt Basics

**Qt**: Cross-platform GUI framework (C++)
**PyQt**: Python bindings for Qt

```python
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel
from PyQt5.QtCore import Qt
import sys

app = QApplication(sys.argv)
window = QMainWindow()
window.setWindowTitle("My App")
window.show()
sys.exit(app.exec_())
```

### 2. Widgets

Common Qt widgets:
- `QWidget` - Base class for all UI elements
- `QMainWindow` - Main application window
- `QLabel` - Display text or images
- `QPushButton` - Clickable button
- `QLineEdit` - Single-line text input
- `QTextEdit` - Multi-line text editor
- `QSpinBox` - Numeric input
- `QSlider` - Slider control
- `QComboBox` - Dropdown list

### 3. Layouts

Automatic widget positioning:
```python
from PyQt5.QtWidgets import QVBoxLayout, QHBoxLayout

# Vertical layout
vlayout = QVBoxLayout()
vlayout.addWidget(widget1)
vlayout.addWidget(widget2)

# Horizontal layout
hlayout = QHBoxLayout()
hlayout.addWidget(widget3)
hlayout.addWidget(widget4)

# Apply to container
container.setLayout(vlayout)
```

Layout types:
- `QVBoxLayout` - Vertical stack
- `QHBoxLayout` - Horizontal row
- `QGridLayout` - Grid (rows × columns)
- `QFormLayout` - Form with labels

### 4. Signals and Slots

**Event-driven programming**: Respond to user actions

```python
# Signal: Event that can be emitted
# Slot: Function that handles signal

button = QPushButton("Click me")
button.clicked.connect(on_button_clicked)

def on_button_clicked():
    print("Button was clicked!")
```

Common signals:
- `clicked` - Button clicked
- `textChanged` - Text edited
- `valueChanged` - Value changed (spinbox, slider)
- `currentIndexChanged` - Selection changed (combobox)

### 5. Image Processing

```python
from PyQt5.QtGui import QImage, QPixmap

# Load image
image = QImage("photo.jpg")

# Display in label
pixmap = QPixmap.fromImage(image)
label.setPixmap(pixmap)

# Pixel access
rgb = image.pixel(x, y)
r = (rgb >> 16) & 0xFF
g = (rgb >> 8) & 0xFF
b = rgb & 0xFF

# Modify pixel
new_rgb = (r << 16) | (g << 8) | b
image.setPixel(x, y, new_rgb)
```

### 6. MDI (Multiple Document Interface)

```python
from PyQt5.QtWidgets import QMdiArea, QMdiSubWindow

mdi_area = QMdiArea()
sub_window = QMdiSubWindow()
sub_window.setWidget(child_widget)
mdi_area.addSubWindow(sub_window)
sub_window.show()
```

## Exercises Overview

### Exercise 1: Simple Window
Create basic window with widgets and layouts.

**Concepts**:
- QMainWindow
- QLabel, QPushButton
- Layouts
- Window properties (title, size)

### Exercise 2: Image Viewer
Build image viewer application.

**Features**:
- Load and display images
- Zoom in/out
- Navigate between images
- Image transformations

**Files**: `ex2/tp6-p2_e.py`

### Exercise 3: Clock Widget
Create analog or digital clock widget.

**Concepts**:
- QPainter for custom drawing
- QTimer for periodic updates
- Coordinate transformations

**Files**: `ex3/Horloge_e.py`

### Exercise 4: MDI Image Editor
Multi-document interface for editing images.

**Features**:
- Multiple image windows
- RGB color adjustment
- True color vs indexed color
- Window management

**Files**: `ex4/fenetreMDI_e.py`, `principalMDI_e.py`

## Solutions

See `src/` and exercise directories (`ex2/`, `ex3/`, `ex4/`) for complete implementations.

## Key Takeaways

1. **Event-driven ≠ procedural** - Code runs in response to events
2. **Signals/slots are powerful** - Clean way to handle interactions
3. **Layouts > absolute positioning** - More flexible, handles resize
4. **Qt is comprehensive** - Has widgets for almost everything
5. **Documentation is essential** - Qt docs are detailed and helpful

## Common Patterns

### Main Window Template
```python
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("App Name")
        self.setGeometry(100, 100, 800, 600)
        self.init_ui()
    
    def init_ui(self):
        # Create widgets
        # Create layouts
        # Connect signals
        pass
```

### Dialog Pattern
```python
from PyQt5.QtWidgets import QDialog, QDialogButtonBox

class MyDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        # Setup dialog
        buttons = QDialogButtonBox(
            QDialogButtonBox.Ok | QDialogButtonBox.Cancel
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
```

### Menu and Toolbar
```python
# Menu bar
menubar = self.menuBar()
file_menu = menubar.addMenu("File")
open_action = file_menu.addAction("Open")
open_action.triggered.connect(self.open_file)

# Toolbar
toolbar = self.addToolBar("Main")
toolbar.addAction(open_action)
```

## Common Pitfalls

1. **Forgetting sys.exit(app.exec_())** - App won't run event loop
2. **Not calling super().__init__()** - Parent class not initialized
3. **Connecting to wrong signal** - Check Qt documentation
4. **Memory leaks with images** - Clear pixmaps when done
5. **Thread safety** - GUI updates must be on main thread
6. **Layout conflicts** - Can't mix manual positioning with layouts

## Further Reading

- PyQt5 Documentation: https://www.riverbankcomputing.com/static/Docs/PyQt5/
- Qt Documentation: https://doc.qt.io/
- Qt Designer: Visual GUI designer tool
- Model-View architecture: For complex data display
- Qt Graphics View: For custom 2D graphics

## Qt Architecture

```
QApplication (manages app)
    └── QMainWindow (main window)
            ├── Central Widget
            ├── Menu Bar
            ├── Toolbars
            └── Status Bar
```

## Image Processing Operations

Common operations on QImage:
- Color space conversion (RGB, grayscale, indexed)
- Filtering (blur, sharpen, edge detection)
- Transformations (rotate, scale, flip)
- Color adjustments (brightness, contrast, saturation)
- Histogram analysis

## Performance Tips

1. **Use QPixmap for display** - Optimized for screen rendering
2. **Process with QImage** - Optimized for pixel manipulation
3. **Cache expensive operations** - Don't recalculate on every paint
4. **Update only changed regions** - Use update(QRect) not update()
5. **Consider threading** - Long operations should be off main thread
