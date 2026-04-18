---
title: "Programmation d'interface graphique Qt"
sidebar_position: 6
---

# Programmation d'interface graphique Qt

## Apercu

Qt est un framework d'interface graphique multiplateforme. Le cours LDS utilise PyQt5 (bindings Python pour Qt) pour construire des applications graphiques. Les concepts cles incluent les widgets, les layouts, les signaux/slots (gestion des evenements) et le traitement d'images.

## Structure d'une application PyQt5

### Application minimale

```python noexec
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel
import sys

app = QApplication(sys.argv)           # Creer l'application
window = QMainWindow()                  # Creer la fenetre principale
window.setWindowTitle("My App")
window.setGeometry(100, 100, 800, 600) # x, y, largeur, hauteur

label = QLabel("Hello, Qt!", window)
window.setCentralWidget(label)

window.show()
sys.exit(app.exec_())                   # Demarrer la boucle evenementielle
```

### Programmation evenementielle

Les applications Qt sont **evenementielles** : le programme attend des evenements (clics, appuis de touches, etc.) et repond via des **connexions signal-slot**.

```
L'utilisateur clique sur un bouton
    --> Le bouton emet le signal "clicked"
        --> La fonction slot connectee s'execute
```

## Widgets

### Widgets courants

| Widget | Objectif | Proprietes cles |
|--------|----------|-----------------|
| `QWidget` | Classe de base pour tous les elements d'interface | parent, geometry |
| `QMainWindow` | Fenetre principale avec menu/barre d'outils/barre d'etat | centralWidget |
| `QLabel` | Afficher du texte ou des images | text, pixmap |
| `QPushButton` | Bouton cliquable | text, signal clicked |
| `QLineEdit` | Champ de saisie sur une ligne | text, signal textChanged |
| `QTextEdit` | Editeur de texte multi-lignes | toPlainText(), setPlainText() |
| `QSpinBox` | Saisie d'entier avec fleches | value, signal valueChanged |
| `QDoubleSpinBox` | Saisie de flottant avec fleches | value, decimals |
| `QSlider` | Curseur de reglage | value, signal valueChanged |
| `QComboBox` | Liste deroulante | currentText, currentIndexChanged |
| `QCheckBox` | Case a cocher | isChecked, stateChanged |
| `QRadioButton` | Bouton radio (exclusif) | isChecked, toggled |
| `QProgressBar` | Indicateur de progression | setValue, minimum, maximum |

### Exemples de widgets

```python noexec
from PyQt5.QtWidgets import (
    QPushButton, QLabel, QLineEdit, QSpinBox,
    QSlider, QComboBox, QCheckBox
)

# Bouton
button = QPushButton("Click Me")
button.setEnabled(True)
button.clicked.connect(on_click)

# Label
label = QLabel("Status: Ready")
label.setText("Updated text")

# Champ de saisie
text_input = QLineEdit()
text_input.setPlaceholderText("Enter name...")
text_input.textChanged.connect(on_text_change)
name = text_input.text()

# Spin box
spin = QSpinBox()
spin.setRange(0, 100)
spin.setValue(50)
spin.valueChanged.connect(on_value_change)

# Curseur
slider = QSlider(Qt.Horizontal)
slider.setRange(0, 255)
slider.valueChanged.connect(on_slider_change)

# Liste deroulante
combo = QComboBox()
combo.addItems(["Option A", "Option B", "Option C"])
combo.currentIndexChanged.connect(on_selection_change)

# Case a cocher
checkbox = QCheckBox("Enable feature")
checkbox.stateChanged.connect(on_toggle)
```

## Layouts

Les layouts positionnent automatiquement les widgets et gerent le redimensionnement de la fenetre.

### Types de layouts

```python noexec
from PyQt5.QtWidgets import (
    QVBoxLayout, QHBoxLayout, QGridLayout, QFormLayout, QWidget
)

# Layout vertical (empiler de haut en bas)
vlayout = QVBoxLayout()
vlayout.addWidget(widget1)
vlayout.addWidget(widget2)
vlayout.addWidget(widget3)

# Layout horizontal (de gauche a droite)
hlayout = QHBoxLayout()
hlayout.addWidget(widget1)
hlayout.addWidget(widget2)

# Layout en grille (lignes x colonnes)
grid = QGridLayout()
grid.addWidget(widget1, 0, 0)     # Ligne 0, Col 0
grid.addWidget(widget2, 0, 1)     # Ligne 0, Col 1
grid.addWidget(widget3, 1, 0, 1, 2)  # Ligne 1, Col 0, couvre 1 ligne x 2 cols

# Layout de formulaire (paires label + champ)
form = QFormLayout()
form.addRow("Name:", QLineEdit())
form.addRow("Age:", QSpinBox())

# Appliquer un layout a un widget conteneur
container = QWidget()
container.setLayout(vlayout)
```

### Imbrication de layouts

```python noexec
# Layout vertical principal avec des layouts horizontaux imbriques
main_layout = QVBoxLayout()

# Ligne du haut (horizontale)
top_row = QHBoxLayout()
top_row.addWidget(QPushButton("A"))
top_row.addWidget(QPushButton("B"))

# Ligne du bas
bottom_row = QHBoxLayout()
bottom_row.addWidget(QPushButton("C"))
bottom_row.addWidget(QPushButton("D"))

main_layout.addLayout(top_row)
main_layout.addLayout(bottom_row)
```

## Signaux et slots

### Connecter des signaux a des slots

```python noexec
# Connecter un signal a une fonction (slot)
button.clicked.connect(self.on_button_clicked)
slider.valueChanged.connect(self.on_slider_changed)
text_input.textChanged.connect(self.on_text_changed)

# Fonctions slot
def on_button_clicked(self):
    print("Button clicked!")

def on_slider_changed(self, value):
    self.label.setText(f"Value: {value}")

def on_text_changed(self, text):
    print(f"Text: {text}")
```

### Signaux personnalises

```python noexec
from PyQt5.QtCore import pyqtSignal

class MyWidget(QWidget):
    # Definir un signal personnalise
    data_changed = pyqtSignal(str)
    
    def update_data(self, new_data):
        # Emettre le signal
        self.data_changed.emit(new_data)

# Connecter le signal personnalise
widget.data_changed.connect(handle_data_change)
```

## Traitement d'images

### Charger et afficher des images

```python noexec
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtWidgets import QLabel

# Charger une image
image = QImage("photo.jpg")

# Afficher dans un QLabel
pixmap = QPixmap.fromImage(image)
label = QLabel()
label.setPixmap(pixmap)

# Affichage redimensionne
scaled_pixmap = pixmap.scaled(400, 300, Qt.KeepAspectRatio)
label.setPixmap(scaled_pixmap)
```

### Manipulation de pixels

```python noexec
# Acceder a la couleur d'un pixel
# QImage.pixel() retourne QRgb au format 0xAARRGGBB
rgb = image.pixel(x, y)
r = (rgb >> 16) & 0xFF
g = (rgb >> 8) & 0xFF
b = rgb & 0xFF

# Modifier un pixel
# Note : pour Format_RGB32, l'alpha est ignore (toujours opaque).
# Pour Format_ARGB32, inclure l'alpha : (0xFF << 24) | (r << 16) | (g << 8) | b
new_rgb = (r << 16) | (g << 8) | b
image.setPixel(x, y, new_rgb)

# Conversion en niveaux de gris
for x in range(image.width()):
    for y in range(image.height()):
        rgb = image.pixel(x, y)
        r = (rgb >> 16) & 0xFF
        g = (rgb >> 8) & 0xFF
        b = rgb & 0xFF
        gray = int(0.299 * r + 0.587 * g + 0.114 * b)
        image.setPixel(x, y, (gray << 16) | (gray << 8) | gray)
```

### Proprietes de l'image

```python noexec
width = image.width()
height = image.height()
depth = image.depth()              # Bits par pixel
format_type = image.format()       # QImage.Format_RGB32, etc.
```

## MDI (Interface multi-documents)

```python noexec
from PyQt5.QtWidgets import QMdiArea, QMdiSubWindow

# Creer une zone MDI comme widget central
mdi = QMdiArea()
main_window.setCentralWidget(mdi)

# Ajouter des sous-fenetres
sub = QMdiSubWindow()
sub.setWidget(some_widget)
mdi.addSubWindow(sub)
sub.show()

# Gestion des fenetres
mdi.cascadeSubWindows()
mdi.tileSubWindows()
```

## Menus et barres d'outils

```python noexec
# Barre de menus
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

# Barre d'outils
toolbar = self.addToolBar("Main")
toolbar.addAction(open_action)
toolbar.addAction(save_action)
```

## Boites de dialogue

```python noexec
from PyQt5.QtWidgets import QFileDialog, QMessageBox, QInputDialog

# Dialogue d'ouverture de fichier
filename, _ = QFileDialog.getOpenFileName(
    self, "Open File", "", "Images (*.png *.jpg);;All Files (*)"
)

# Dialogue de sauvegarde de fichier
filename, _ = QFileDialog.getSaveFileName(
    self, "Save File", "", "Text Files (*.txt)"
)

# Boite de message
QMessageBox.information(self, "Info", "Operation completed")
QMessageBox.warning(self, "Warning", "Check your input")
reply = QMessageBox.question(self, "Confirm", "Are you sure?")
if reply == QMessageBox.Yes:
    # continuer

# Dialogue de saisie
text, ok = QInputDialog.getText(self, "Input", "Enter name:")
number, ok = QInputDialog.getInt(self, "Input", "Enter age:", 18, 0, 120)
```

## Modele d'application complet

```python noexec
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
        # Widget central et layout
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
        
        # Signaux
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

## QPainter (dessin personnalise)

```python noexec
from PyQt5.QtGui import QPainter, QColor, QPen
from PyQt5.QtCore import Qt

class ClockWidget(QWidget):
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Dessiner des formes
        painter.setPen(QPen(Qt.black, 2))
        painter.drawLine(0, 0, 100, 100)
        painter.drawRect(10, 10, 80, 60)
        painter.drawEllipse(50, 50, 100, 100)
        
        # Remplissage
        painter.setBrush(QColor(255, 0, 0))    # Remplissage rouge
        painter.drawRect(20, 20, 50, 50)
        
        painter.end()
```

## QTimer

```python noexec
from PyQt5.QtCore import QTimer

# Timer periodique
timer = QTimer()
timer.timeout.connect(self.update_display)
timer.start(1000)        # Toutes les 1000ms

# Tir unique
QTimer.singleShot(5000, self.delayed_action)
```

---

## AIDE-MEMOIRE

### Structure de l'application
```python noexec
app = QApplication(sys.argv)
window = QMainWindow()
window.show()
sys.exit(app.exec_())
```

### Widgets courants
```
QLabel, QPushButton, QLineEdit, QTextEdit
QSpinBox, QSlider, QComboBox, QCheckBox
QTableView, QListView, QTreeView
```

### Layouts
```
QVBoxLayout   Empilement vertical
QHBoxLayout   Ligne horizontale
QGridLayout   Grille lignes x colonnes
QFormLayout   Paires label + champ
```

### Signaux/Slots
```python noexec
widget.signal.connect(slot_function)
button.clicked.connect(self.on_click)
slider.valueChanged.connect(self.on_change)
```

### Image
```python noexec
image = QImage("file.jpg")
pixmap = QPixmap.fromImage(image)
label.setPixmap(pixmap)
rgb = image.pixel(x, y)
```

### Boites de dialogue
```python noexec
QFileDialog.getOpenFileName(...)
QMessageBox.information(self, "Title", "Text")
QInputDialog.getText(self, "Title", "Prompt:")
```
