pragma Singleton
import QtQuick 2.15

QtObject {
    // Primary palette
    readonly property color primary: "#1976D2"
    readonly property color primaryDark: "#0D47A1"
    readonly property color primaryLight: "#BBDEFB"
    readonly property color secondary: "#FF6F00"
    readonly property color secondaryLight: "#FFE082"

    // Surface colors
    readonly property color background: "#FAFAFA"
    readonly property color surface: "#FFFFFF"
    readonly property color surfaceVariant: "#F5F5F5"
    readonly property color error: "#D32F2F"
    readonly property color success: "#388E3C"
    readonly property color warning: "#F57C00"

    // Text colors
    readonly property color textPrimary: "#212121"
    readonly property color textSecondary: "#757575"
    readonly property color textOnPrimary: "#FFFFFF"
    readonly property color textOnSecondary: "#FFFFFF"
    readonly property color textDisabled: "#BDBDBD"

    // Borders and dividers
    readonly property color divider: "#E0E0E0"
    readonly property color border: "#BDBDBD"

    // Category colors
    readonly property color installedColor: "#4CAF50"
    readonly property color notInstalledColor: "#9E9E9E"

    // Font sizes
    readonly property int fontSizeSmall: 11
    readonly property int fontSizeNormal: 13
    readonly property int fontSizeMedium: 15
    readonly property int fontSizeLarge: 18
    readonly property int fontSizeTitle: 22
    readonly property int fontSizeHeader: 28

    // Spacing
    readonly property int spacingSmall: 4
    readonly property int spacingNormal: 8
    readonly property int spacingMedium: 12
    readonly property int spacingLarge: 16
    readonly property int spacingXLarge: 24

    // Border radius
    readonly property int radiusSmall: 4
    readonly property int radiusMedium: 8
    readonly property int radiusLarge: 12

    // Shadows
    readonly property int elevationLow: 2
    readonly property int elevationMedium: 4
    readonly property int elevationHigh: 8
}
