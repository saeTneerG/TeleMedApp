import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const InputBox = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default'
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.padding,
    },
    label: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12, // ความสูงของช่อง
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
    },
});

export default InputBox;