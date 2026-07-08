const fs = require('fs');

const file = 'c:\\\\Users\\\\priya\\\\Desktop\\\\KisanMitra\\\\src\\\\utils\\\\translations.js';
let content = fs.readFileSync(file, 'utf8');

const newTranslations = {
  hi: `"Complete": "पूरा करें",
    "Reschedule": "पुनर्निर्धारित करें",
    "High": "उच्च",
    "Medium": "मध्यम",
    "Low": "कम",
    "Irrigation Scheduled": "सिंचाई निर्धारित",
    "Active Disease Risk Alert!": "सक्रिय रोग जोखिम अलर्ट!",
    "Scan Leaf": "पत्ती स्कैन करें",
    "Weather conditions indicate elevated risk of Stripe Rust in your area.": "मौसम की स्थिति आपके क्षेत्र में स्ट्राइप रस्ट के बढ़े हुए जोखिम का संकेत देती है।",
    "Weather conditions indicate elevated risk of Blast disease in your area.": "मौसम की स्थिति आपके क्षेत्र में ब्लास्ट रोग के बढ़े हुए जोखिम का संकेत देती है।",
    "PM Kisan Samman Nidhi": "पीएम-किसान सम्मान निधि",
    "Subsidized Fertilizers Distribution": "सब्सिडी वाले उर्वरक वितरण",
    "₹6,000 / year direct subsidy": "₹6,000 / वर्ष सीधी सब्सिडी",
    "Up to 50% discount on Urea bags": "यूरिया बैग पर 50% तक की छूट",
    "Apply by July 15": "15 जुलाई तक आवेदन करें",
    "Ongoing at APMC Coop": "एपीएमसी कोप में जारी",
    "Apply": "आवेदन करें",
    "Rainfall is 18% above normal. Standing water risk is high. Ensure active drainage channels on your farm to avoid crop root rot.": "बारिश सामान्य से 18% अधिक है। जलभराव का जोखिम अधिक है। फसल की जड़ों को सड़ने से बचाने के लिए अपने खेत में सक्रिय जल निकासी चैनल सुनिश्चित करें।"`,
  mr: `"Complete": "पूर्ण",
    "Reschedule": "पुन्हा शेड्युल करा",
    "High": "उच्च",
    "Medium": "मध्यम",
    "Low": "कमी",
    "Irrigation Scheduled": "सिंचन निर्धारित",
    "Active Disease Risk Alert!": "सक्रिय रोग धोका अलर्ट!",
    "Scan Leaf": "पान स्कॅन करा",
    "Weather conditions indicate elevated risk of Stripe Rust in your area.": "हवामानाची स्थिती तुमच्या भागात स्ट्राइप रस्टचा वाढलेला धोका दर्शवते.",
    "Weather conditions indicate elevated risk of Blast disease in your area.": "हवामानाची स्थिती तुमच्या भागात ब्लास्ट रोगाचा वाढलेला धोका दर्शवते.",
    "PM Kisan Samman Nidhi": "पीएम-किसान सन्मान निधी",
    "Subsidized Fertilizers Distribution": "अनुदानित खते वितरण",
    "₹6,000 / year direct subsidy": "₹6,000 / वर्ष थेट सबसिडी",
    "Up to 50% discount on Urea bags": "युरिया बॅगवर 50% पर्यंत सूट",
    "Apply by July 15": "15 जुलैपर्यंत अर्ज करा",
    "Ongoing at APMC Coop": "एपीएमसी कोपमध्ये सुरू आहे",
    "Apply": "अर्ज करा",
    "Rainfall is 18% above normal. Standing water risk is high. Ensure active drainage channels on your farm to avoid crop root rot.": "पाऊस सामान्यपेक्षा 18% अधिक आहे. पाणी साचण्याचा धोका जास्त आहे. पिकांच्या मुळांना कुजण्यापासून वाचवण्यासाठी तुमच्या शेतात सक्रिय पाणी निचरा चॅनेल सुनिश्चित करा."`,
  te: `"Complete": "పూర్తి చేయండి",
    "Reschedule": "తిరిగి షెడ్యూల్ చేయండి",
    "High": "అధిక",
    "Medium": "మధ్యస్థ",
    "Low": "తక్కువ",
    "Irrigation Scheduled": "నీటిపారుదల షెడ్యూల్ చేయబడింది",
    "Active Disease Risk Alert!": "యాక్టివ్ డిసీజ్ రిస్క్ అలర్ట్!",
    "Scan Leaf": "ఆకును స్కాన్ చేయండి",
    "Weather conditions indicate elevated risk of Stripe Rust in your area.": "వాతావరణ పరిస్థితులు మీ ప్రాంతంలో స్ట్రైప్ రస్ట్ ప్రమాదాన్ని సూచిస్తున్నాయి.",
    "Weather conditions indicate elevated risk of Blast disease in your area.": "వాతావరణ పరిస్థితులు మీ ప్రాంతంలో బ్లాస్ట్ వ్యాధి ప్రమాదాన్ని సూచిస్తున్నాయి.",
    "PM Kisan Samman Nidhi": "పిఎమ్ కిసాన్ సమ్మాన్ నిధి",
    "Subsidized Fertilizers Distribution": "సబ్సిడీ ఎరువుల పంపిణీ",
    "₹6,000 / year direct subsidy": "సంవత్సరానికి ₹6,000 ప్రత్యక్ష సబ్సిడీ",
    "Up to 50% discount on Urea bags": "యూరియా బ్యాగ్‌లపై 50% వరకు తగ్గింపు",
    "Apply by July 15": "జూలై 15 లోగా దరఖాస్తు చేయండి",
    "Ongoing at APMC Coop": "APMC కోప్‌లో కొనసాగుతోంది",
    "Apply": "దరఖాస్తు చేయండి",
    "Rainfall is 18% above normal. Standing water risk is high. Ensure active drainage channels on your farm to avoid crop root rot.": "వర్షపాతం సాధారణం కంటే 18% ఎక్కువ. నీరు నిలిచిపోయే ప్రమాదం ఉంది. పంట వేర్లు కుళ్ళిపోకుండా మీ పొలంలో నీటి పారుదల కాలువలు ఉన్నాయని నిర్ధారించుకోండి."`,
  pa: `"Complete": "ਪੂਰਾ ਕਰੋ",
    "Reschedule": "ਮੁੜ ਤਹਿ ਕਰੋ",
    "High": "ਉੱਚ",
    "Medium": "ਮੱਧਮ",
    "Low": "ਘੱਟ",
    "Irrigation Scheduled": "ਸਿੰਚਾਈ ਤਹਿ ਕੀਤੀ ਗਈ",
    "Active Disease Risk Alert!": "ਸਰਗਰਮ ਬਿਮਾਰੀ ਜੋਖਮ ਅਲਰਟ!",
    "Scan Leaf": "ਪੱਤਾ ਸਕੈਨ ਕਰੋ",
    "Weather conditions indicate elevated risk of Stripe Rust in your area.": "ਮੌਸਮ ਦੀਆਂ ਸਥਿਤੀਆਂ ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਸਟ੍ਰਾਈਪ ਰਸਟ ਦੇ ਵਧੇ ਹੋਏ ਜੋਖਮ ਨੂੰ ਦਰਸਾਉਂਦੀਆਂ ਹਨ.",
    "Weather conditions indicate elevated risk of Blast disease in your area.": "ਮੌਸਮ ਦੀਆਂ ਸਥਿਤੀਆਂ ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਬਲਾਸਟ ਰੋਗ ਦੇ ਵਧੇ ਹੋਏ ਜੋਖਮ ਨੂੰ ਦਰਸਾਉਂਦੀਆਂ ਹਨ.",
    "PM Kisan Samman Nidhi": "ਪੀਐਮ-ਕਿਸਾਨ ਸੰਮਾਨ ਨਿਧੀ",
    "Subsidized Fertilizers Distribution": "ਸਬਸਿਡੀ ਵਾਲੀ ਖਾਦ ਵੰਡ",
    "₹6,000 / year direct subsidy": "₹6,000 / ਸਾਲ ਸਿੱਧੀ ਸਬਸਿਡੀ",
    "Up to 50% discount on Urea bags": "ਯੂਰੀਆ ਬੈਗ 'ਤੇ 50% ਤੱਕ ਦੀ ਛੋਟ",
    "Apply by July 15": "15 ਜੁਲਾਈ ਤੱਕ ਅਪਲਾਈ ਕਰੋ",
    "Ongoing at APMC Coop": "ਏਪੀਐਮਸੀ ਕੋਆਪ ਵਿਖੇ ਜਾਰੀ",
    "Apply": "ਅਪਲਾਈ ਕਰੋ",
    "Rainfall is 18% above normal. Standing water risk is high. Ensure active drainage channels on your farm to avoid crop root rot.": "ਮੀਂਹ ਆਮ ਨਾਲੋਂ 18% ਵੱਧ ਹੈ। ਖੜ੍ਹੇ ਪਾਣੀ ਦਾ ਜੋਖਮ ਜ਼ਿਆਦਾ ਹੈ। ਫਸਲਾਂ ਦੀਆਂ ਜੜ੍ਹਾਂ ਨੂੰ ਸੜਨ ਤੋਂ ਬਚਾਉਣ ਲਈ ਆਪਣੇ ਖੇਤ ਵਿੱਚ ਸਰਗਰਮ ਡਰੇਨੇਜ ਚੈਨਲਾਂ ਨੂੰ ਯਕੀਨੀ ਬਣਾਓ।"`,
  kn: `"Complete": "ಪೂರ್ಣಗೊಳಿಸಿ",
    "Reschedule": "ಮರುಹೊಂದಿಸಿ",
    "High": "ಹೆಚ್ಚು",
    "Medium": "ಮಧ್ಯಮ",
    "Low": "ಕಡಿಮೆ",
    "Irrigation Scheduled": "ನೀರಾವರಿ ನಿಗದಿಯಾಗಿದೆ",
    "Active Disease Risk Alert!": "ಸಕ್ರಿಯ ರೋಗ ಅಪಾಯ ಎಚ್ಚರಿಕೆ!",
    "Scan Leaf": "ಎಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "Weather conditions indicate elevated risk of Stripe Rust in your area.": "ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳು ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಸ್ಟ್ರೈಪ್ ರಸ್ಟ್ ಅಪಾಯವನ್ನು ಸೂಚಿಸುತ್ತವೆ.",
    "Weather conditions indicate elevated risk of Blast disease in your area.": "ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳು ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಬ್ಲಾಸ್ಟ್ ರೋಗದ ಅಪಾಯವನ್ನು ಸೂಚಿಸುತ್ತವೆ.",
    "PM Kisan Samman Nidhi": "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    "Subsidized Fertilizers Distribution": "ಸಬ್ಸಿಡಿ ರಸಗೊಬ್ಬರಗಳ ವಿತರಣೆ",
    "₹6,000 / year direct subsidy": "ವರ್ಷಕ್ಕೆ ₹6,000 ನೇರ ಸಬ್ಸಿಡಿ",
    "Up to 50% discount on Urea bags": "ಯೂರಿಯಾ ಚೀಲಗಳ ಮೇಲೆ 50% ರಷ್ಟು ರಿಯಾಯಿತಿ",
    "Apply by July 15": "ಜುಲೈ 15 ರೊಳಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    "Ongoing at APMC Coop": "ಎಪಿಎಂಸಿ ಕೋಪ್‌ನಲ್ಲಿ ನಡೆಯುತ್ತಿದೆ",
    "Apply": "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    "Rainfall is 18% above normal. Standing water risk is high. Ensure active drainage channels on your farm to avoid crop root rot.": "ಮಳೆಯು ಸಾಮಾನ್ಯಕ್ಕಿಂತ 18% ಹೆಚ್ಚಾಗಿದೆ. ನಿಂತ ನೀರಿನ ಅಪಾಯ ಹೆಚ್ಚು. ಬೆಳೆ ಬೇರು ಕೊಳೆಯುವುದನ್ನು ತಪ್ಪಿಸಲು ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ಸಕ್ರಿಯ ಒಳಚರಂಡಿ ಕಾಲುವೆಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."`
};

for (const lang in newTranslations) {
  let marker = "";
  if (lang === 'hi') marker = '"Scheduled": "निर्धारित"';
  if (lang === 'mr') marker = '"Scheduled": "नियोजित"';
  if (lang === 'te') marker = '"Scheduled": "షెడ్యూల్ చేయబడింది"';
  if (lang === 'pa') marker = '"Scheduled": "ਤਹਿ ਕੀਤਾ"';
  if (lang === 'kn') marker = '"Scheduled": "ನಿಗದಿತ"';
  
  content = content.replace(marker, marker + ',\\n' + newTranslations[lang]);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Translations updated!");
