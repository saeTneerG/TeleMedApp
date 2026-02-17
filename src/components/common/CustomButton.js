import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const CustomButton = ({
    title,
    onPress,
    type = 'primary', // primary (สีหลัก), secondary (สีรอง), outline (ขอบใส)
    isLoading = false
}) => {
    const getBackgroundColor = () => {
        if (type === 'primary') return COLORS.primary;
        if (type === 'secondary') return COLORS.secondary;
        if (type === 'danger') return COLORS.danger;
        return 'transparent';
    };

    const getTextColor = () => {
        if (type === 'outline') return COLORS.primary;
        return COLORS.white;
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderWidth: type === 'outline' ? 1 : 0,
                    borderColor: type === 'outline' ? COLORS.primary : 'transparent'
                }
            ]}
            onPress={onPress}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SIZES.padding,
    },
    text: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
});

export default CustomButton;