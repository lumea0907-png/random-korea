
(function () {
  "use strict";

  const regions = [
    { code:"seoul", name:"서울특별시", lat:37.5665, lng:126.9780, themes:["food","culture"], spots:["경복궁","북촌한옥마을","한강공원"], food:"서울식 불고기", desc:"전통과 트렌드가 공존하는 도시 여행", en:"Seoul", zh:"首尔", ja:"ソウル" },
    { code:"busan", name:"부산광역시", lat:35.1796, lng:129.0756, themes:["ocean","food"], spots:["해운대해수욕장","감천문화마을","광안리해변"], food:"돼지국밥", desc:"바다와 먹거리를 함께 즐기는 여행", en:"Busan", zh:"釜山", ja:"釜山" },
    { code:"daegu", name:"대구광역시", lat:35.8714, lng:128.6014, themes:["food","culture"], spots:["김광석다시그리기길","앞산전망대","서문시장"], food:"막창구이", desc:"먹거리와 도심 명소를 둘러보는 여행", en:"Daegu", zh:"大邱", ja:"大邱" },
    { code:"incheon", name:"인천광역시", lat:37.4563, lng:126.7052, themes:["ocean","culture"], spots:["차이나타운","월미도","송도센트럴파크"], food:"짜장면", desc:"항구 감성과 현대적인 풍경을 즐기는 여행", en:"Incheon", zh:"仁川", ja:"仁川" },
    { code:"gwangju", name:"광주광역시", lat:35.1595, lng:126.8526, themes:["food","culture"], spots:["국립아시아문화전당","양림동","무등산"], food:"광주 한정식", desc:"예술과 남도 음식이 어우러지는 여행", en:"Gwangju", zh:"光州", ja:"光州" },
    { code:"daejeon", name:"대전광역시", lat:36.3504, lng:127.3845, themes:["food","nature"], spots:["한밭수목원","성심당 주변","장태산자연휴양림"], food:"칼국수", desc:"도심 산책과 먹거리를 즐기는 여행", en:"Daejeon", zh:"大田", ja:"大田" },
    { code:"ulsan", name:"울산광역시", lat:35.5384, lng:129.3114, themes:["ocean","nature"], spots:["대왕암공원","간절곶","태화강 국가정원"], food:"언양불고기", desc:"바다와 생태 명소를 만나는 여행", en:"Ulsan", zh:"蔚山", ja:"蔚山" },
    { code:"sejong", name:"세종특별자치시", lat:36.4800, lng:127.2890, themes:["nature","culture"], spots:["세종호수공원","국립세종수목원","금강보행교"], food:"지역 로컬 맛집", desc:"호수와 정원을 따라 걷는 여행", en:"Sejong", zh:"世宗", ja:"世宗" },
    { code:"gyeonggi", name:"경기도", lat:37.4138, lng:127.5183, themes:["nature","culture"], spots:["수원화성","한국민속촌","두물머리"], food:"수원 왕갈비", desc:"서울 근교에서 즐기는 다양한 나들이", en:"Gyeonggi-do", zh:"京畿道", ja:"京畿道" },
    { code:"gangwon", name:"강원특별자치도", lat:37.8228, lng:128.1555, themes:["nature","ocean"], spots:["설악산","경포해변","남이섬"], food:"막국수", desc:"산과 바다에서 쉬어가는 여행", en:"Gangwon State", zh:"江原特别自治道", ja:"江原特別自治道" },
    { code:"chungbuk", name:"충청북도", lat:36.6357, lng:127.4912, themes:["nature","culture"], spots:["도담삼봉","청남대","속리산"], food:"올갱이국", desc:"호수와 산의 풍경을 즐기는 여행", en:"Chungcheongbuk-do", zh:"忠清北道", ja:"忠清北道" },
    { code:"chungnam", name:"충청남도", lat:36.6588, lng:126.6728, themes:["nature","ocean"], spots:["꽃지해수욕장","공산성","대천해수욕장"], food:"게국지", desc:"서해 바다와 역사 유적을 둘러보는 여행", en:"Chungcheongnam-do", zh:"忠清南道", ja:"忠清南道" },
    { code:"jeonbuk", name:"전북특별자치도", lat:35.7175, lng:127.1530, themes:["food","culture"], spots:["전주한옥마을","내장산","마이산"], food:"전주비빔밥", desc:"한옥과 풍성한 향토 음식을 즐기는 여행", en:"Jeonbuk State", zh:"全北特别自治道", ja:"全北特別自治道" },
    { code:"jeonnam", name:"전라남도", lat:34.8161, lng:126.4629, themes:["ocean","food"], spots:["여수 오동도","순천만습지","보성 녹차밭"], food:"남도 한정식", desc:"남해 풍경과 지역 음식을 만나는 여행", en:"Jeollanam-do", zh:"全罗南道", ja:"全羅南道" },
    { code:"gyeongbuk", name:"경상북도", lat:36.4919, lng:128.8889, themes:["culture","nature"], spots:["불국사","첨성대","주왕산"], food:"안동찜닭", desc:"천년 역사와 자연 경관을 즐기는 여행", en:"Gyeongsangbuk-do", zh:"庆尚北道", ja:"慶尚北道" },
    { code:"gyeongnam", name:"경상남도", lat:35.4606, lng:128.2132, themes:["nature","ocean"], spots:["통영 동피랑","남해 독일마을","진주성"], food:"충무김밥", desc:"남해안 풍경과 역사 명소를 만나는 여행", en:"Gyeongsangnam-do", zh:"庆尚南道", ja:"慶尚南道" },
    { code:"jeju", name:"제주특별자치도", lat:33.4996, lng:126.5312, themes:["ocean","nature"], spots:["성산일출봉","협재해변","한라산"], food:"흑돼지", desc:"섬의 자연과 바다를 만끽하는 여행", en:"Jeju Island", zh:"济州岛", ja:"済州島" }
  ];

  // [코드, 광역지역 코드, 지역명, 위도, 경도, 명소1, 명소2, 명소3, 먹거리, 테마]
  const districtRows = [
    ["jongno","seoul","종로구",37.5729,126.9794,"경복궁","북촌한옥마을","인사동","한정식","culture"],
    ["mapo","seoul","마포구",37.5663,126.9014,"홍대거리","경의선숲길","망원시장","망원시장 먹거리","food"],
    ["gangnam","seoul","강남구",37.5172,127.0473,"코엑스","봉은사","선정릉","한우구이","food"],
    ["haeundae","busan","해운대구",35.1631,129.1635,"해운대해수욕장","동백섬","해리단길","해산물","ocean"],
    ["yeongdo","busan","영도구",35.0912,129.0679,"흰여울문화마을","태종대","절영해안산책로","어묵","ocean"],
    ["jung-busan","busan","중구",35.1062,129.0323,"국제시장","자갈치시장","용두산공원","씨앗호떡","food"],
    ["suseong","daegu","수성구",35.8583,128.6308,"수성못","대구미술관","앞산전망대","막창","nature"],
    ["jung-incheon","incheon","중구",37.4738,126.6216,"차이나타운","월미도","개항장거리","짜장면","culture"],
    ["yeonsu","incheon","연수구",37.4102,126.6783,"송도센트럴파크","트라이보울","인천도시역사관","해산물","nature"],
    ["nam-gwangju","gwangju","남구",35.1328,126.9026,"양림동역사문화마을","펭귄마을","사직공원","남도 음식","culture"],
    ["yuseong","daejeon","유성구",36.3622,127.3561,"유성온천","국립중앙과학관","계족산","칼국수","nature"],
    ["dong-ulsan","ulsan","동구",35.5049,129.4166,"대왕암공원","일산해수욕장","슬도","고래고기 요리","ocean"],
    ["sejong-city","sejong","세종시",36.4800,127.2890,"세종호수공원","국립세종수목원","금강보행교","로컬 맛집","nature"],
    ["suwon","gyeonggi","수원시",37.2636,127.0286,"수원화성","행궁동","광교호수공원","수원 왕갈비","culture"],
    ["gapyeong","gyeonggi","가평군",37.8315,127.5095,"남이섬","아침고요수목원","자라섬","닭갈비","nature"],
    ["paju","gyeonggi","파주시",37.7599,126.7800,"임진각","헤이리예술마을","출판도시","장단콩 요리","culture"],
    ["sokcho","gangwon","속초시",38.2070,128.5918,"속초해변","영금정","속초관광수산시장","오징어순대","ocean"],
    ["gangneung","gangwon","강릉시",37.7519,128.8761,"경포해변","안목해변","오죽헌","초당순두부","ocean"],
    ["pyeongchang","gangwon","평창군",37.3705,128.3900,"대관령","월정사","오대산","황태 요리","nature"],
    ["jecheon","chungbuk","제천시",37.1326,128.1910,"청풍호","의림지","비봉산 전망대","약초 음식","nature"],
    ["danyang","chungbuk","단양군",36.9845,128.3655,"도담삼봉","만천하스카이워크","고수동굴","마늘 요리","nature"],
    ["cheongju","chungbuk","청주시",36.6424,127.4890,"청남대","상당산성","초정행궁","올갱이국","culture"],
    ["boryeong","chungnam","보령시",36.3335,126.6129,"대천해수욕장","죽도 상화원","성주산","해산물","ocean"],
    ["gongju","chungnam","공주시",36.4465,127.1190,"공산성","무령왕릉","공주한옥마을","밤 디저트","culture"],
    ["taean","chungnam","태안군",36.7456,126.2980,"꽃지해수욕장","신두리 해안사구","천리포수목원","게국지","ocean"],
    ["jeonju","jeonbuk","전주시",35.8242,127.1480,"전주한옥마을","경기전","덕진공원","전주비빔밥","food"],
    ["namwon","jeonbuk","남원시",35.4164,127.3904,"광한루원","지리산","춘향테마파크","추어탕","culture"],
    ["muju","jeonbuk","무주군",36.0071,127.6608,"덕유산","머루와인동굴","태권도원","산채 요리","nature"],
    ["yeosu","jeonnam","여수시",34.7604,127.6622,"오동도","향일암","여수해상케이블카","갓김치","ocean"],
    ["suncheon","jeonnam","순천시",34.9506,127.4872,"순천만습지","순천만국가정원","낙안읍성","꼬막 요리","nature"],
    ["boseong","jeonnam","보성군",34.7715,127.0801,"대한다원","율포해변","제암산","녹차 디저트","nature"],
    ["gyeongju","gyeongbuk","경주시",35.8562,129.2247,"불국사","첨성대","대릉원","경주빵","culture"],
    ["andong","gyeongbuk","안동시",36.5684,128.7294,"하회마을","월영교","도산서원","안동찜닭","culture"],
    ["pohang","gyeongbuk","포항시",36.0190,129.3435,"호미곶","영일대해수욕장","스페이스워크","과메기","ocean"],
    ["tongyeong","gyeongnam","통영시",34.8544,128.4330,"동피랑","미륵산","디피랑","충무김밥","ocean"],
    ["namhae","gyeongnam","남해군",34.8377,127.8925,"독일마을","다랭이마을","상주은모래비치","멸치쌈밥","ocean"],
    ["jinju","gyeongnam","진주시",35.1799,128.1076,"진주성","진양호","월아산 숲속의 진주","진주냉면","culture"],
    ["jeju-city","jeju","제주시",33.4996,126.5312,"동문시장","이호테우해변","용두암","고기국수","food"],
    ["seogwipo","jeju","서귀포시",33.2541,126.5601,"천지연폭포","정방폭포","올레시장","갈치조림","ocean"],
    ["seongsan","jeju","성산읍",33.4580,126.9420,"성산일출봉","광치기해변","섭지코지","해산물","nature"],
    ["goyang","gyeonggi","고양시",37.6584,126.8320,"일산호수공원","행주산성","현대 모터스튜디오","장항동 맛집","nature"],
    ["yangpyeong","gyeonggi","양평군",37.4917,127.4875,"두물머리","세미원","용문사","연잎밥","nature"],
    ["chuncheon","gangwon","춘천시",37.8813,127.7298,"남이섬 인근","소양강 스카이워크","김유정문학촌","닭갈비","food"],
    ["taebaek","gangwon","태백시",37.1641,128.9856,"태백산","황지연못","구문소","한우","nature"],
    ["ulsan-nam","ulsan","남구",35.5438,129.3300,"장생포고래문화마을","울산대공원","태화강 국가정원","언양불고기","culture"]
  ];

  const detailedDistricts = districtRows.map(function (row) {
    return {
      code: row[0],
      parentCode: row[1],
      name: row[2],
      lat: row[3],
      lng: row[4],
      spots: [row[5], row[6], row[7]],
      food: row[8],
      themes: [row[9]],
      desc: row[2] + "의 대표 명소와 지역 먹거리를 즐겨보세요."
    };
  });

  const i18n = {
    ko: {
      title: "오늘 어디로 떠나볼까요?",
      draw: "랜덤 여행지 뽑기",
      wide: "광역시·도",
      detail: "세부 시·군·구",
      result: "오늘의 추천 여행지",
      mapReady: "지도 연결됨",
      mapPartial: "지도 일부 사용 가능",
      mapFallback: "지도 타일 연결 실패 · 추첨 기능 사용 가능",
      empty: "조건에 맞는 여행지가 없습니다. 다른 테마를 선택해 주세요.",
      copy: "결과 복사",
      copied: "여행지 정보가 복사되었습니다.",
      copyFail: "복사할 수 없습니다. 여행지 이름을 직접 복사해 주세요.",
      party: "여행 인원"
    },
    en: {
      title: "Where will you travel today?",
      draw: "Pick a random destination",
      wide: "Province / Metro city",
      detail: "City / District",
      result: "Today's destination",
      mapReady: "Map connected",
      mapPartial: "Map partially available",
      mapFallback: "Map tiles unavailable · Drawing still works",
      empty: "No destinations match. Try another theme.",
      copy: "Copy result",
      copied: "Destination copied.",
      copyFail: "Unable to copy. Please copy the destination manually.",
      party: "Travel party"
    },
    zh: {
      title: "今天想去哪里旅行？",
      draw: "随机抽取旅行目的地",
      wide: "广域市 / 道",
      detail: "市 / 郡 / 区",
      result: "今日推荐目的地",
      mapReady: "地图已连接",
      mapPartial: "地图部分可用",
      mapFallback: "地图加载失败 · 仍可抽取目的地",
      empty: "没有符合条件的目的地，请更换主题。",
      copy: "复制结果",
      copied: "已复制目的地信息。",
      copyFail: "复制失败，请手动复制目的地名称。",
      party: "旅行人数"
    },
    ja: {
      title: "今日はどこへ旅行しますか？",
      draw: "ランダム旅行先を選ぶ",
      wide: "広域市・道",
      detail: "市・郡・区",
      result: "今日のおすすめ旅行先",
      mapReady: "地図に接続しました",
      mapPartial: "地図は一部利用可能",
      mapFallback: "地図タイルを読み込めません・抽選は利用可能",
      empty: "条件に合う旅行先がありません。テーマを変更してください。",
      copy: "結果をコピー",
      copied: "旅行先情報をコピーしました。",
      copyFail: "コピーできません。旅行先を手動でコピーしてください。",
      party: "旅行人数"
    }
  };

  window.RandomKoreaData = {
    regions: regions,
    detailedDistricts: detailedDistricts,
    i18n: i18n
  };
})();