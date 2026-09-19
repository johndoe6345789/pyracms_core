pragma Singleton
import QtQuick

// Steam-like palette. Dark is the default, light is an option
// (Settings -> Appearance). Main.qml binds isDark to the saved setting.
QtObject {
    property bool isDark: true

    // Surfaces
    readonly property color bg: isDark ? "#1b2838" : "#e8edf3"
    readonly property color topBar: isDark ? "#171a21" : "#cfd7e1"
    readonly property color sidebar: isDark ? "#16202d" : "#dbe2ea"
    readonly property color panel: isDark ? "#1f3044" : "#ffffff"
    readonly property color panelHover: isDark ? "#2a475e" : "#dfeaf5"
    readonly property color rowSelected: isDark ? "#3d6c8e" : "#b9d3ec"
    readonly property color field: isDark ? "#101822" : "#f7f9fb"

    // Accents
    readonly property color accent: isDark ? "#1a9fff" : "#1478c8"
    readonly property color accentDim: isDark ? "#2c6a99" : "#7fb0dd"
    readonly property color green: isDark ? "#5c9e1f" : "#4a8a12"
    readonly property color danger: isDark ? "#c14a3d" : "#b23a2e"
    readonly property color warning: "#d8a31a"
    readonly property color success: isDark ? "#7cc23b" : "#3f8a10"
    readonly property color disabled: isDark ? "#3a4654" : "#b4bec9"

    // Text
    readonly property color textBright: isDark ? "#ffffff" : "#0d1822"
    readonly property color text: isDark ? "#c6d4df" : "#22303d"
    readonly property color textDim: isDark ? "#8f98a0" : "#5a6672"
    readonly property color accentText: "#ffffff"

    readonly property color divider: isDark ? "#2b3b4d" : "#c2ccd7"
    readonly property color focusRing: isDark ? "#ffffff" : "#0d1822"

    // Type scale
    readonly property int fontSmall: 11
    readonly property int fontNormal: 13
    readonly property int fontMedium: 15
    readonly property int fontLarge: 18
    readonly property int fontTitle: 26
    readonly property int fontHero: 38

    // Spacing / shape
    readonly property int spaceS: 4
    readonly property int spaceM: 8
    readonly property int spaceL: 16
    readonly property int spaceXL: 24
    readonly property int radius: 3
    readonly property int sidebarWidth: 300
    readonly property int dialogWidth: 440
    readonly property int dialogWidthWide: 560
}
