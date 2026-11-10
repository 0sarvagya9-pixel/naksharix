import {Alert,Image,Linking,Pressable,ScrollView,StyleSheet,Text,View} from "react-native";
import {colors,sharedStyles as S} from "../ui/theme";
import {webUrl} from "../config/env";
import type {AppTab} from "../navigation/tabs";

type Props={onNavigate:(tab:AppTab)=>void};
const tiles:ReadonlyArray<{title:string,description:string,icon:string,target:AppTab}>=[
  {title:"Daily Rashifal",description:"Explore all 12 zodiac signs",icon:"☼",target:"horoscope"},
  {title:"Today's Panchang",description:"Location-specific calculation",icon:"☾",target:"panchang"},
  {title:"Numerology",description:"Offline and private on your phone",icon:"◈",target:"numerology"},
  {title:"Spiritual catalogue",description:"Puja, Shop and Reports",icon:"✦",target:"discover"}
];
const links=[
  {label:"Free Kundli",path:"/kundli"},
  {label:"Matchmaking",path:"/matchmaking"},
  {label:"AI Astrologer",path:"/ai-astrologer"},
  {label:"Puja calendar",path:"/puja-calendar"}
];
function open(path:string){
  Linking.openURL(webUrl(path)).catch(()=>Alert.alert("Link unavailable","Could not open the official Naksharix website."));
}

export function HomeScreen({onNavigate}:Props){
  return <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
    <View style={styles.hero}>
      <View style={styles.heroHeader}>
        <View style={{flex:1}}>
          <Text style={styles.heroEyebrow}>NAKSHARIX  •  YOUR COSMIC COMPANION</Text>
          <Text style={styles.heroTitle}>Ancient wisdom.{"\n"}A modern journey.</Text>
        </View>
        <Image source={require("../../assets/icon.png")} style={styles.logo} accessibilityLabel="Naksharix brand mark"/>
      </View>
      <Text style={styles.heroText}>Horoscope, Panchang and traditional tools—beautifully designed for your phone.</Text>
      <Pressable style={styles.heroButton} accessibilityRole="button" onPress={()=>onNavigate("horoscope")}>
        <Text style={styles.heroButtonText}>Explore your zodiac  →</Text>
      </Pressable>
      <Text style={styles.heroBadge}>✧  NO ACCOUNT NEEDED FOR FREE TOOLS</Text>
    </View>
    <View style={styles.headingRow}>
      <Text style={S.sectionTitle}>Your daily essentials</Text>
      <Text style={styles.smallGold}>DISCOVER</Text>
    </View>
    <View style={styles.grid}>
      {tiles.map(tile=><Pressable key={tile.title} style={styles.tile} accessibilityRole="button"
        accessibilityLabel={tile.title} onPress={()=>onNavigate(tile.target)}>
        <Text style={styles.tileIcon}>{tile.icon}</Text>
        <Text style={S.cardTitle}>{tile.title}</Text>
        <Text style={S.cardText}>{tile.description}</Text>
        <Text style={styles.arrow}>Explore  →</Text>
      </Pressable>)}
    </View>
    <Text style={S.sectionTitle}>More from Naksharix</Text>
    <Text style={S.subtitle}>Connected experiences open on the official secure website.</Text>
    <View style={styles.links}>
      {links.map(item=><Pressable key={item.path} style={styles.linkRow} onPress={()=>open(item.path)}
        accessibilityRole="link">
        <Text style={styles.linkText}>{item.label}</Text><Text style={styles.linkArrow}>↗</Text>
      </Pressable>)}
    </View>
    <View style={S.card}>
      <Text style={S.cardTitle}>Trust and transparency</Text>
      <Text style={S.cardText}>Astrological guidance is reflective, not a guaranteed outcome. No payment details or private birth data are stored in this app.</Text>
    </View>
    <Text style={styles.footnote}>NAKSHARIX  ·  EXPLORE WITH CONFIDENCE</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({
  hero:{borderRadius:26,backgroundColor:colors.burgundyDeep,padding:22,gap:15,overflow:"hidden"},
  heroHeader:{flexDirection:"row",gap:8,alignItems:"center"},
  heroEyebrow:{color:"#F0C986",fontSize:10,letterSpacing:1.4,fontWeight:"800"},
  heroTitle:{color:"#FFF9EF",fontSize:29,lineHeight:36,fontWeight:"900",marginTop:13},
  logo:{width:75,height:75,borderRadius:18},
  heroText:{color:"#F4E5E9",fontSize:14,lineHeight:23},
  heroButton:{backgroundColor:"#DAB573",borderRadius:13,padding:14,alignSelf:"flex-start",minHeight:48,justifyContent:"center"},
  heroButtonText:{color:colors.ink,fontSize:14,fontWeight:"900"},
  heroBadge:{color:"#F1DDA6",fontSize:10,letterSpacing:1.1,fontWeight:"800"},
  headingRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  smallGold:{color:colors.gold,fontSize:10,letterSpacing:1.1,fontWeight:"900"},
  grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",rowGap:12},
  tile:{backgroundColor:colors.surface,borderRadius:18,borderColor:colors.border,borderWidth:1,
    width:"48%",minHeight:170,padding:16,gap:7},
  tileIcon:{fontSize:24,color:colors.gold,fontWeight:"800"},
  arrow:{color:colors.burgundy,fontSize:12,fontWeight:"800",marginTop:"auto"},
  links:{backgroundColor:colors.surface,borderColor:colors.border,borderRadius:18,borderWidth:1,overflow:"hidden"},
  linkRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",
    borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border,padding:17,minHeight:52},
  linkText:{color:colors.ink,fontWeight:"700",fontSize:14},
  linkArrow:{color:colors.gold,fontSize:18,fontWeight:"700"},
  footnote:{color:colors.muted,fontSize:10,textAlign:"center",letterSpacing:2,marginTop:5}
});
