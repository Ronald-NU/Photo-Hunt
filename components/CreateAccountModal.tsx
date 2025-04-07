import { colors } from "@/constants/Colors";
import { GeneralStyle, TextStyles } from "@/constants/Styles";
import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import TouchableButton from "./TouchableButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

const CreateAccountModal = ({ isOpen, onClose, onSignUp }: ModalProps) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
    >
      <View style={GeneralStyle.overlay}>
        <View style={GeneralStyle.modalContainer}>
          <Text style={[styles.title, TextStyles.LargeText]}>Create an Account</Text>
          <Text style={[styles.message,TextStyles.smallText]}>You need to create an account to view your profile or create new games to share.</Text>
          <View style={styles.buttonContainer}>
            <TouchableButton title="Sign Up" onPress={onSignUp} widthBut={'48%'}/>
            <TouchableButton title="Cancel" onPress={onClose} widthBut={'48%'} colors={colors.DarkGrey}/>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default CreateAccountModal;