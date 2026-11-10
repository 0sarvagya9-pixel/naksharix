import {useState} from "react";
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from "react-native";
import {colors,sharedStyles as S} from "../ui/theme";
import {computeBirthNumber} from "./numerology";

export function NumerologyScreen({onBack}:{onBack:()=>void}){
  const [birthDate,setBirthDate]=useState("");
  const result=computeBirthNumber(birthDate);
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={S.scroll}>
    <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
      <Text style={styles.backText}>‹  Back to home</Text>
    </Pressable>
    <Text style={S.eyebrow}>PRIVATE • OFFLINE</Text>
    <Text style={S.title}>Numerology Explorer</Text>
    <Text style={S.subtitle}>Traditional numbers, explained clearly. Nothing you enter is transmitted or saved.</Text>
    <View style={S.card}>
      <Text style={styles.label}>Date of birth</Text>
      <Text style={S.cardText}>YYYY-MM-DD</Text>
      <TextInput accessibilityLabel="Date of birth, year month day" placeholder="1995-08-12"
        placeholderTextColor="#9C8791" style={styles.input} keyboardType="numbers-and-punctuation"
        autoCorrect={false} autoCapitalize="none" maxLength={10}
        value={birthDate} onChangeText={setBirthDate}/>
      {result?<View style={styles.numbers}>
        <View style={styles.numberCard}>
          <Text style={S.cardText}>Birth number</Text>
          <Text style={styles.value}>{result.dayNumber}</Text>
        </View>
        <View style={styles.numberCard}>
          <Text style={S.cardText}>Life-path digit</Text>
          <Text style={styles.value}>{result.lifePath}</Text>
        </View>
      </View>:birthDate.length===10?
        <Text accessibilityRole="alert" style={styles.error}>Enter a real date between 1900-01-01 and 2100-12-31.</Text>:
        <Text style={S.cardText}>Enter a complete date to see your private calculation.</Text>}
    </View>
    <View style={S.card}>
      <Text style={S.cardTitle}>How are the numbers calculated?</Text>
      <Text style={S.cardText}>The birth number is the digital root of the day; the life-path number is the digital root of all birth-date digits. These are cultural numerology conventions, not scientific predictions.</Text>
      <Text style={S.cardText}>All calculations run on this device. There is no network call or saved profile.</Text>
    </View>
  </ScrollView>;
}
const styles=StyleSheet.create({
  backButton:{alignSelf:"flex-start",minHeight:44,justifyContent:"center"},
  backText:{fontSize:14,color:colors.burgundy,fontWeight:"800"},
  label:{fontSize:15,color:colors.ink,fontWeight:"800"},
  input:{marginTop:4,minHeight:53,borderWidth:1,borderColor:colors.border,borderRadius:13,
    paddingHorizontal:15,color:colors.ink,backgroundColor:colors.background,fontSize:18},
  numbers:{flexDirection:"row",gap:12,marginTop:10},
  numberCard:{flex:1,alignItems:"center",backgroundColor:colors.softGold,padding:18,borderRadius:16},
  value:{fontWeight:"900",fontSize:44,color:colors.burgundy},
  error:{color:colors.error,fontSize:13,fontWeight:"700",lineHeight:19}
});
