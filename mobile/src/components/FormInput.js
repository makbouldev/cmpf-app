import { TextInput, View } from 'react-native';

export default function FormInput({ styles, multiline, shellStyle, inputStyle, placeholderTextColor, ...props }) {
  return (
    <View style={[styles.inputShell, shellStyle]}>
      <TextInput
        {...props}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
        placeholderTextColor={placeholderTextColor || '#7f91ad'}
        textAlign="left"
      />
    </View>
  );
}
