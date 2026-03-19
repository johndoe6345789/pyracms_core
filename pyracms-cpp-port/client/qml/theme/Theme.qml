pragma Singleton
import QtQuick 2.15

QtObject {
    // Dark mode toggle — bound from SettingsManager
    property bool isDark: false

    // Primary palette
    readonly property color primary: isDark ? "#90CAF9" : "#1976D2"
    readonly property color primaryDark: isDark ? "#42A5F5" : "#0D47A1"
    readonly property color primaryLight: isDark ? "#E3F2FD" : "#BBDEFB"
    readonly property color secondary: isDark ? "#FFB74D" : "#FF6F00"
    readonly property color secondaryLight: isDark ? "#FFE0B2" : "#FFE082"

    // Surface colors
    readonly property color background: isDark ? "#121212" : "#FAFAFA"
    readonly property color surface: isDark ? "#1E1E1E" : "#FFFFFF"
    readonly property color surfaceVariant: isDark ? "#2C2C2C" : "#F5F5F5"
    readonly property color error: isDark ? "#EF5350" : "#D32F2F"
    readonly property color success: isDark ? "#66BB6A" : "#388E3C"
    readonly property color warning: isDark ? "#FFA726" : "#F57C00"

    // Text colors
    readonly property color textPrimary: isDark ? "#E0E0E0" : "#212121"
    readonly property color textSecondary: isDark ? "#9E9E9E" : "#757575"
    readonly property color textOnPrimary: "#FFFFFF"
    readonly property color textOnSecondary: "#FFFFFF"
    readonly property color textDisabled: isDark ? "#616161" : "#BDBDBD"

    // Borders and dividers
    readonly property color divider: isDark ? "#424242" : "#E0E0E0"
    readonly property color border: isDark ? "#616161" : "#BDBDBD"

    // Category colors
    readonly property color installedColor: "#4CAF50"
    readonly property color notInstalledColor: isDark ? "#616161" : "#9E9E9E"

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
