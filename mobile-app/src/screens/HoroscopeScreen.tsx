import {useEffect,useState} from "react";
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View} from "react-native";
import {getPublicData} from "../config/api";
import {zodiacSigns,type ZodiacSign} from "../data/zodiac";
import {colors,sharedStyles as S} from "../ui/theme";
type Period="daily"|"weekly"|"monthly"|"yearly";
type Horoscope={zodiac:string;period:Period;title:string;subtitle:string;overview:string;
  sections:Array<{title:string;body:string}>;luckyNumber:string;luckyColor:string;remedy:string;notice:string};
const periods:ReadonlyArray<{id:Period,label:string}>=[
  {id:"daily",label:"Today"},{id:"weekly",label:"Week"},
  {id:"monthly",label:"Month"},{id:"yearly",label:"2026"}
];

export function HoroscopeScreen(){
  const [sign,setSign]=useState<ZodiacSign>("aries");
  const [period,setPeriod]=useState<Period>("daily");
  const [state,setState]=useState<{loading:boolean;data:Horoscope|null;error:string}>({loading:true,data:null,error:""});
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    setState({loading:true,data:null,error:""});
    const url="/api/mobile/horoscope?zodiac="+encodeURIComponent(sign)+
      "&period="+encodeURIComponent(period)+"&locale=en";
    getPublicData<Horoscope>(url,controller.signal)
      .then(result=>{
        if(controller.signal.aborted)return;
        if(!result||typeof result.overview!=="string"||!Array.isArray(result.sections))
          throw Error("Invalid horoscope response");
        setState({loading:false,data:result,error:""});
      })
      .catch(error=>{if(!controller.signal.aborted)
        setState({loading:false,data:null,error:error instanceof Error?error.message:"Service unavailable"});});
    return()=>controller.abort();
  },[sign,period,refresh]);
  const selected=zodiacSigns.find(z=>z.id===sign)!;
  return <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
    <Text style={S.eyebrow}>RASHIFAL • SIGN-LEVEL GUIDANCE</Text>
    <Text style={S.title}>Your Horoscope</Text>
    <Text style={S.subtitle}>Choose a zodiac sign and period. Guidance is general and reflective, not a personal prediction.</Text>
    <View style={styles.periods}>
      {periods.map(p=><Pressable key={p.id} accessibilityRole="button" accessibilityState={{selected:p.id===period}}
        style={[S.pill,p.id===period&&S.pillSelected]} onPress={()=>setPeriod(p.id)}>
        <Text style={[S.pillText,p.id===period&&S.pillTextSelected]}>{p.label}</Text>
      </Pressable>)}
    </View>
    <View style={styles.signGrid}>
      {zodiacSigns.map(z=><Pressable key={z.id} accessibilityRole="button"
        accessibilityLabel={z.label+" "+z.hindi} accessibilityState={{selected:z.id===sign}}
        onPress={()=>setSign(z.id)} style={[styles.sign,z.id===sign&&styles.signSelected]}>
        <Text style={[styles.symbol,z.id===sign&&styles.signTextSelected]}>{z.symbol}</Text>
        <Text style={[styles.signName,z.id===sign&&styles.signTextSelected]}>{z.label}</Text>
      </Pressable>)}
    </View>
    <View style={styles.resultHeader}>
      <Text style={styles.largeSymbol}>{selected.symbol}</Text>
      <View style={{flex:1}}>
        <Text style={styles.selectedTitle}>{selected.label} / {selected.hindi}</Text>
        <Text style={styles.selectedSubtitle}>{period==="yearly"?"2026 yearly themes":period+" guidance"}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={()=>setRefresh(n=>n+1)} style={styles.refresh}>
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>
    </View>
    {state.loading?<View style={styles.loading}>
      <ActivityIndicator color={colors.burgundy} size="large"/>
      <Text style={S.cardText}>Loading the latest published guidance...</Text>
    </View>:state.error?<View style={S.card}>
      <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
      <Pressable onPress={()=>setRefresh(n=>n+1)} style={S.button} accessibilityRole="button">
        <Text style={S.buttonText}>Try again</Text>
      </Pressable>
    </View>:state.data?<View style={{gap:13}}>
      <View style={[S.card,{backgroundColor:colors.softGold}]}>
        <Text style={S.eyebrow}>YOUR GUIDANCE</Text>
        <Text style={S.cardTitle}>{state.data.title||"Zodiac reflection"}</Text>
        <Text style={S.cardText}>{state.data.overview}</Text>
      </View>
      <View style={styles.twocol}>
        <View style={styles.mini}><Text style={styles.miniLabel}>Lucky number</Text>
          <Text style={styles.miniValue}>{String(state.data.luckyNumber||"—")}</Text></View>
        <View style={styles.mini}><Text style={styles.miniLabel}>Color</Text>
          <Text style={styles.colorValue}>{state.data.luckyColor||"—"}</Text></View>
      </View>
      {state.data.sections.map((section,index)=><View key={section.title+"-"+index} style={S.card}>
        <Text style={S.cardTitle}>{section.title}</Text>
        <Text style={S.cardText}>{section.body}</Text>
      </View>)}
      {state.data.remedy?<View style={S.card}>
        <Text style={S.cardTitle}>Traditional reflection</Text>
        <Text style={S.cardText}>{state.data.remedy}</Text>
      </View>:null}
    </View>:null}
    <Text style={S.disclaimer}>Sign-based interpretations are for reflection. They cannot guarantee medical, relationship, financial or life outcomes.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({
  periods:{flexDirection:"row",justifyContent:"space-between",gap:6},
  signGrid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",rowGap:8},
  sign:{width:"31.5%",borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,
    borderRadius:15,alignItems:"center",paddingVertical:11,gap:3,minHeight:73},
  signSelected:{backgroundColor:colors.burgundy,borderColor:colors.burgundy},
  symbol:{fontSize:21,color:colors.gold},signName:{fontSize:11,color:colors.ink,fontWeight:"800"},
  signTextSelected:{color:colors.white},
  resultHeader:{flexDirection:"row",alignItems:"center",gap:13,backgroundColor:colors.surface,
    borderRadius:17,padding:15,borderWidth:1,borderColor:colors.border},
  largeSymbol:{fontSize:37,color:colors.gold},
  selectedTitle:{fontSize:18,fontWeight:"900",color:colors.ink},
  selectedSubtitle:{fontSize:12,color:colors.muted,marginTop:3,textTransform:"capitalize"},
  refresh:{padding:9,backgroundColor:colors.softGold,borderRadius:8,minHeight:40,justifyContent:"center"},
  refreshText:{color:colors.burgundy,fontSize:12,fontWeight:"800"},
  loading:{padding:38,alignItems:"center",gap:14},
  twocol:{flexDirection:"row",gap:12},
  mini:{flex:1,backgroundColor:colors.surface,padding:17,borderRadius:16,borderWidth:1,borderColor:colors.border,minHeight:90},
  miniLabel:{fontSize:11,fontWeight:"700",color:colors.muted},
  miniValue:{fontSize:26,fontWeight:"900",color:colors.burgundy,marginTop:4},
  colorValue:{fontSize:16,fontWeight:"900",color:colors.burgundy,marginTop:9},
  error:{color:colors.error,fontSize:14,lineHeight:21}
});
