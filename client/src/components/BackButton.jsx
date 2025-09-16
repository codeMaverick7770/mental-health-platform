import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({ color = '#fff', size = 25, style }) => {
    const navigation = useNavigation();
    // univerasl backbutton can be use in any screen
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={size} color={color} />
        </TouchableOpacity>
    );
};

export default BackButton;

const styles = StyleSheet.create({});
