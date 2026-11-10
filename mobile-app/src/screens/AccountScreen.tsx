import {Alert,Linking,Pressable,ScrollView,StyleSheet,Text,View} from "react-native";
import {colors,sharedStyles as S} from "../ui/theme";
import {webUrl} from "../config/env";

const links=[
  {label:"Sign in or create account",path:"/login",detail:"Secure web authentication"},
  {label:"My dashboard",path:"/dashboard",detail:"Private reports and profile"},
  {label:"Saved reports",path:"/saved-reports",detail:"Your protected document library"},
  {label:"Consultations",path:"/consultation",detail:"Current verified availability"},
  {label:"Contact support",path:"/contact",detail:"Questions and assistance"},
  {label:"Privacy policy",path:"/privacy",detail:"What data we collect"},
  {label:"Terms of service",path:"/terms",detail:"Service terms and policies"}
];
async function open(path:string){
  try {await Linking.openURL(webUrl(path));}
  catch {Alert.alert("Unable to open","Please check your network and try again.");}
}
export function AccountScreen(){
  return <ScrollView contentContainerStyle={S.scroll}>
    <Text style={S.eyebrow}>ACCOUNT & SAFETY</Text>
    <Text style={S.title}>Your Naksharix</Text>
    <Text style={S.subtitle}>Login, paid services and private reports stay within the official secure account system.</Text>
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>Secure account access</Text>
      <Text style={styles.heroText}>Sign-in happens in your browser. Passwords and authentication tokens are never collected or stored by this native app.</Text>
      <Pressable style={styles.button} onPress={()=>open("/login")} accessibilityRole="link">
        <Text style={styles.buttonText}>Continue securely  ↗</Text>
      </Pressable>
    </View>
    <View style={styles.links}>
      {links.map(item=><Pressable key={item.path} style={styles.item} onPress={()=>open(item.path)}
        accessibilityRole="link" accessibilityLabel={item.label}>
        <View style={{flex:1}}>
          <Text style={styles.itemTitle}>{item.label}</Text>
          <Text style={S.cardText}>{item.detail}</Text>
        </View>
        <Text style={styles.arrow}>↗</Text>
      </Pressable>)}
    </View>
    <Text style={[S.disclaimer,{marginTop:5}]}>Naksharix cannot guarantee astrological outcomes. Products, experts, bookings and reports are available only when confirmed by the official service.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({
  hero:{backgroundColor:colors.burgundyDeep,borderRadius:22,padding:20,gap:13},
  heroTitle:{color:colors.white,fontWeight:"900",fontSize:21},
  heroText:{color:"#F1E3E9",lineHeight:22,fontSize:13},
  button:{minHeight:45,backgroundColor:"#DAB573",borderRadius:12,padding:12,alignItems:"center"},
  buttonText:{fontSize:14,fontWeight:"900",color:colors.ink},
  links:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:18,overflow:"hidden"},
  item:{flexDirection:"row",alignItems:"center",minHeight:69,padding:14,borderBottomWidth:StyleSheet.hairlineWidth,
    borderBottomColor:colors.border,gap:12},
  itemTitle:{color:colors.ink,fontSize:14,fontWeight:"800",marginBottom:3},
  arrow:{fontSize:19,color:colors.gold}
});
