// Karnataka Districts → Taluks → Villages
// Comprehensive location data for Karnataka, India

export const KARNATAKA_DISTRICTS: { name: string }[] = [
  { name: 'Bagalkote' },
  { name: 'Ballari' },
  { name: 'Belagavi' },
  { name: 'Bengaluru Rural' },
  { name: 'Bengaluru Urban' },
  { name: 'Bidar' },
  { name: 'Chamarajanagara' },
  { name: 'Chikkaballapura' },
  { name: 'Chikkamagaluru' },
  { name: 'Chitradurga' },
  { name: 'Dakshina Kannada' },
  { name: 'Davanagere' },
  { name: 'Dharwad' },
  { name: 'Gadag' },
  { name: 'Hassan' },
  { name: 'Haveri' },
  { name: 'Kalaburagi' },
  { name: 'Kodagu' },
  { name: 'Kolar' },
  { name: 'Koppal' },
  { name: 'Mandya' },
  { name: 'Mysuru' },
  { name: 'Raichur' },
  { name: 'Ramanagara' },
  { name: 'Shivamogga' },
  { name: 'Tumakuru' },
  { name: 'Udupi' },
  { name: 'Uttara Kannada' },
  { name: 'Vijayapura' },
  { name: 'Yadgir' },
];

export const karnatakaDistricts = KARNATAKA_DISTRICTS.map((d) => d.name);

export const districtTaluks: Record<string, string[]> = {
  'Bagalkote': ['Bagalkote', 'Badami', 'Bilgi', 'Hungund', 'Jamkhandi', 'Mudhol'],
  'Ballari': ['Ballari', 'Hagari Bommanahalli', 'Hospete', 'Kudligi', 'Sandur', 'Siruguppa'],
  'Belagavi': ['Athani', 'Bailhongal', 'Belagavi', 'Chikodi', 'Gokak', 'Hukkeri', 'Khanapur', 'Ramdurg', 'Raybag', 'Savadatti'],
  'Bengaluru Rural': ['Devanahalli', 'Doddaballapura', 'Hosakote', 'Nelamangala'],
  'Bengaluru Urban': ['Anekal', 'Bengaluru East', 'Bengaluru North', 'Bengaluru South', 'Bengaluru West'],
  'Bidar': ['Aurad', 'Basavakalyan', 'Bhalki', 'Bidar', 'Humnabad'],
  'Chamarajanagara': ['Chamarajanagara', 'Gundlupet', 'Kollegal', 'Yelandur'],
  'Chikkaballapura': ['Bagepalli', 'Chikkaballapura', 'Chintamani', 'Gauribidanur', 'Gudibande', 'Sidlaghatta'],
  'Chikkamagaluru': ['Chikkamagaluru', 'Kadur', 'Koppa', 'Mudigere', 'NR Pura', 'Sringeri', 'Tarikere'],
  'Chitradurga': ['Challakere', 'Chitradurga', 'Hiriyur', 'Holalkere', 'Hosadurga', 'Molakalmuru'],
  'Dakshina Kannada': ['Bantwal', 'Belthangady', 'Mangaluru', 'Puttur', 'Sullia'],
  'Davanagere': ['Channagiri', 'Davanagere', 'Harihara', 'Honnali', 'Jagalur', 'Nyamathi'],
  'Dharwad': ['Dharwad', 'Hubli', 'Kalghatgi', 'Kundgol', 'Navalgund'],
  'Gadag': ['Gadag', 'Mundargi', 'Nargund', 'Ron', 'Shirhatti'],
  'Hassan': ['Alur', 'Arakalagudu', 'Arkalgud', 'Belur', 'Channarayapatna', 'Hassan', 'Holenarasipur', 'Sakleshpur'],
  'Haveri': ['Byadgi', 'Hanagal', 'Haveri', 'Hirekerur', 'Ranebennur', 'Savanur', 'Shiggaon'],
  'Kalaburagi': ['Afzalpur', 'Aland', 'Chincholi', 'Chittapur', 'Jevargi', 'Kalaburagi', 'Sedam'],
  'Kodagu': ['Madikeri', 'Somwarpet', 'Virajpet'],
  'Kolar': ['Bangarpet', 'KGF (Kolar Gold Fields)', 'Kolar', 'Malur', 'Mulbagal', 'Srinivaspur'],
  'Koppal': ['Gangavathi', 'Koppal', 'Kushtagi', 'Yelburga'],
  'Mandya': ['Krishnarajapete', 'Maddur', 'Malavalli', 'Mandya', 'Nagamangala', 'Pandavapura', 'Srirangapatna'],
  'Mysuru': ['HD Kote', 'Heggadadevankote', 'Hunsur', 'Krishnarajanagara', 'Mysuru', 'Nanjangud', 'Periyapatna', 'TN Pura'],
  'Raichur': ['Devadurga', 'Lingsugur', 'Manvi', 'Mudugal', 'Raichur', 'Sindhanur'],
  'Ramanagara': ['Channapatna', 'Kanakapura', 'Magadi', 'Ramanagara'],
  'Shivamogga': ['Bhadravati', 'Hosanagara', 'Sagara', 'Shivamogga', 'Shikaripura', 'Sorab', 'Tirthahalli'],
  'Tumakuru': ['Chiknayakanhalli', 'Gubbi', 'Koratagere', 'Kunigal', 'Madhugiri', 'Pavagada', 'Sira', 'Tiptur', 'Tumakuru', 'Turuvekere'],
  'Udupi': ['Karkala', 'Kundapur', 'Udupi'],
  'Uttara Kannada': ['Ankola', 'Bhatkal', 'Dandeli', 'Haliyal', 'Honavar', 'Joida', 'Karwar', 'Kumta', 'Mundgod', 'Siddapur', 'Sirsi', 'Yellapur'],
  'Vijayapura': ['Basavana Bagewadi', 'Indi', 'Muddebihal', 'Sindagi', 'Vijayapura'],
  'Yadgir': ['Gurumitkal', 'Shahapur', 'Shorapur', 'Yadgir'],
};

export const talukVillages: Record<string, string[]> = {
  // Bagalkote
  'Bagalkote': ['Bagalkote City', 'Amingad', 'Kerur', 'Lokapur', 'Nandikeshwar', 'Terdal', 'Ilkal'],
  'Badami': ['Badami Town', 'Banashankari', 'Gudur', 'Kuruvinakatti', 'Pattadakal', 'Kudala Sangama'],
  'Bilgi': ['Bilgi Town', 'Gudgeri', 'Jamnal', 'Nidagundi', 'Sultanpur'],
  'Hungund': ['Hungund Town', 'Alagundi', 'Bhadarkhed', 'Gadag Wadagera', 'Kapali'],
  'Jamkhandi': ['Jamkhandi Town', 'Hirepadasalagi', 'Kanakumbi', 'Munavalli', 'Nidoni'],
  'Mudhol': ['Mudhol Town', 'Ainapur', 'Chikkapadasalagi', 'Shiraguppi', 'Takkalaki'],

  // Ballari
  'Ballari': ['Ballari City', 'Kudatini', 'Kurugodu', 'Thotadri', 'Bandihatti', 'Kampli'],
  'Hagari Bommanahalli': ['Hagari', 'Bommanahalli', 'Hirehadagalli', 'Hanumanahalli', 'Madlapur'],
  'Hospete': ['Hospete Town', 'Daroji', 'Hampi', 'Kamalapura', 'Mallapura', 'Toranagallu'],
  'Kudligi': ['Kudligi Town', 'Chittavadagi', 'Kodlaghatta', 'Mariyammanahalli', 'Vadderhatti'],
  'Sandur': ['Sandur Town', 'Devagiri', 'Hirebidari', 'Ramghad', 'Ramnagarahalli'],
  'Siruguppa': ['Siruguppa Town', 'Chikkakoluru', 'Ganaganuru', 'Mangalur', 'Singataluru'],

  // Belagavi
  'Belagavi': ['Belagavi City', 'Macche', 'Nesargi', 'Udyambag', 'Kanbargi', 'Kakati'],
  'Athani': ['Athani Town', 'Ainapur', 'Kagwad', 'Nandagad', 'Ugar Khurd'],
  'Bailhongal': ['Bailhongal Town', 'Chimmad', 'Gudgeri', 'Hire Bagewadi', 'Saundatti'],
  'Chikodi': ['Chikodi Town', 'Ankali', 'Bedkihal', 'Examba', 'Nippani'],
  'Gokak': ['Gokak Town', 'Ghataprabha', 'Hallur', 'Mugalkhod', 'Yaragatti'],
  'Hukkeri': ['Hukkeri Town', 'Hukkanakatti', 'Kognoli', 'Shiraguppi', 'Suttatti'],
  'Khanapur': ['Khanapur Town', 'Anmod', 'Bamboowadi', 'Kanakumbi', 'Vantamuri'],
  'Ramdurg': ['Ramdurg Town', 'Jambagi', 'Managundi', 'Shirakol', 'Soudatti'],
  'Raybag': ['Raybag Town', 'Benakankop', 'Ghodageri', 'Khadaklat', 'Sankeshwar'],
  'Savadatti': ['Savadatti Town', 'Yadwad', 'Mugad', 'Kolur', 'Hooli'],

  // Bengaluru Rural
  'Devanahalli': ['Devanahalli Town', 'Avati', 'Budigere', 'Nandi', 'Sadahalli', 'Vijayapura'],
  'Doddaballapura': ['Doddaballapura Town', 'Bashettihalli', 'Chikkajala', 'Manchanabele', 'Tubagere'],
  'Hosakote': ['Hosakote Town', 'Anugondanahalli', 'Channapatna', 'Jadigenahalli', 'Sulibele'],
  'Nelamangala': ['Nelamangala Town', 'Hesaraghatta', 'Kodigehalli', 'Tavarekere', 'Thyamagondlu'],

  // Bengaluru Urban
  'Anekal': ['Anekal Town', 'Attibele', 'Chandapura', 'Electronic City', 'Jigani', 'Sarjapura'],
  'Bengaluru East': ['Whitefield', 'Marathahalli', 'KR Puram', 'Mahadevapura', 'Bellandur', 'Varthur'],
  'Bengaluru North': ['Hebbal', 'Yelahanka', 'Thanisandra', 'Kogilu', 'Jakkur', 'Nagawara'],
  'Bengaluru South': ['Jayanagar', 'JP Nagar', 'BTM Layout', 'Banashankari', 'Kanakapura Road', 'Hulimavu'],
  'Bengaluru West': ['Rajajinagar', 'Yeshwanthpur', 'Peenya', 'Malleshwaram', 'Tumkur Road', 'Nagarbhavi'],

  // Bidar
  'Bidar': ['Bidar City', 'Chitaguppa', 'Halbarga', 'Manhalli', 'Udgir Road'],
  'Aurad': ['Aurad Town', 'Bidri', 'Chintaki', 'Gadlegaon', 'Raipalli'],
  'Basavakalyan': ['Basavakalyan Town', 'Chandapur', 'Kalmeshwar', 'Mudbi', 'Wadi'],
  'Bhalki': ['Bhalki Town', 'Bidarpur', 'Gundgurthi', 'Hulsur', 'Kamalnagar'],
  'Humnabad': ['Humnabad Town', 'Basavapur', 'Channapur', 'Kaudgaon', 'Sultanpur'],

  // Chamarajanagara
  'Chamarajanagara': ['Chamarajanagara Town', 'Gundal', 'Melur', 'Ramapura', 'Sargur'],
  'Gundlupet': ['Gundlupet Town', 'Begur', 'Kalkere', 'Maldare', 'Ooty Road'],
  'Kollegal': ['Kollegal Town', 'Agara', 'Bettadapura', 'Hanur', 'Mugur'],
  'Yelandur': ['Yelandur Town', 'Gopalaswamy Betta', 'Hemmige', 'Kuderu', 'Nakkal'],

  // Chikkaballapura
  'Chikkaballapura': ['Chikkaballapura Town', 'Bagur', 'Chelur', 'Manchenahalli', 'Nandi Hills'],
  'Bagepalli': ['Bagepalli Town', 'Chintamani Road', 'Gowribidanur Road', 'Kaiwara', 'Thondebhavi'],
  'Chintamani': ['Chintamani Town', 'Avani', 'Chelur', 'Dibburhalli', 'Gudibande'],
  'Gauribidanur': ['Gauribidanur Town', 'Dodderi', 'Gowribidanur', 'Jayamangali', 'Srinivaspura'],
  'Gudibande': ['Gudibande Town', 'Gidnahalli', 'Kondibetta', 'Mittemari', 'Sadali'],
  'Sidlaghatta': ['Sidlaghatta Town', 'Chikkanahalli', 'Gullahalli', 'Hullur', 'Rampura'],

  // Chikkamagaluru
  'Chikkamagaluru': ['Chikkamagaluru Town', 'Aldur', 'Balehonnur', 'Biruru', 'Jayapura', 'Kalasa'],
  'Kadur': ['Kadur Town', 'Birur', 'Holehonnur', 'Niduvalli', 'Santaveri'],
  'Koppa': ['Koppa Town', 'Arehalli', 'Balehonnur', 'Kundapur Road', 'Shingari'],
  'Mudigere': ['Mudigere Town', 'Belur', 'Halebeedu', 'Kemmanagundi', 'Kottigehara'],
  'NR Pura': ['NR Pura Town', 'Arasikere', 'Halehally', 'Jagara', 'Kotehalli'],
  'Sringeri': ['Sringeri Town', 'Agumbe', 'Kigga', 'Mudigere', 'Someshwara'],
  'Tarikere': ['Tarikere Town', 'Ajjampura', 'Bikkodu', 'Channagiri Road', 'Konanur'],

  // Chitradurga
  'Chitradurga': ['Chitradurga Town', 'Bharamasagara', 'Dodderi', 'Hiriyur Road', 'Parashurampura', 'Turuvanur'],
  'Challakere': ['Challakere Town', 'Chiknayakanhalli Road', 'Hariyabbe', 'Kadlebalu', 'Urdigere'],
  'Hiriyur': ['Hiriyur Town', 'Chandravalli', 'Chikkajajur', 'Nittur', 'Ranebennur Road'],
  'Holalkere': ['Holalkere Town', 'Airani', 'Belagur', 'Malebennur', 'Rampur'],
  'Hosadurga': ['Hosadurga Town', 'Chikanayakanahalli', 'Dodda Bathi', 'Gangavati', 'Madhugiri Road'],
  'Molakalmuru': ['Molakalmuru Town', 'Challakere Road', 'Galimadugula', 'Kasaba', 'Siddapura'],

  // Dakshina Kannada
  'Mangaluru': ['Mangaluru City', 'Adyar', 'Bajpe', 'Bondel', 'Derebail', 'Falnir', 'Kankanady', 'Ullal'],
  'Bantwal': ['Bantwal Town', 'Bellare', 'Kaniyuru', 'Panja', 'Sajipanadu', 'Vittal'],
  'Belthangady': ['Belthangady Town', 'Dharmastala', 'Karkala Road', 'Neriya', 'Ujire', 'Venur'],
  'Puttur': ['Puttur Town', 'Bolwar', 'Darbe', 'Kombaru', 'Mundoor', 'Subramanya'],
  'Sullia': ['Sullia Town', 'Aivarnadu', 'Ballamanja', 'Kadaba', 'Sampaje', 'Thenkabail'],

  // Davanagere
  'Davanagere': ['Davanagere City', 'Hadadi', 'Kanavalli', 'Kukkuwada', 'Lokikere', 'Nittuvalli'],
  'Channagiri': ['Channagiri Town', 'Anaji', 'Basavapattana', 'Mallar', 'Rippanpet'],
  'Harihara': ['Harihara Town', 'Harihar Road', 'Hireguntanur', 'Nyamathi', 'Parashurampura'],
  'Honnali': ['Honnali Town', 'Harapanahalli', 'Kaginele', 'Kunduvada', 'Malebennur'],
  'Jagalur': ['Jagalur Town', 'Chikkajogihalli', 'Durgada Halli', 'Kumbarnahalli', 'Malebennur'],
  'Nyamathi': ['Nyamathi Town', 'Belagutti', 'Harpanahalli', 'Hosdurga', 'Ullas'],

  // Dharwad
  'Dharwad': ['Dharwad City', 'Amminabhavi', 'Hebsur', 'Kalaghatagi Road', 'Narendra', 'Alnavar'],
  'Hubli': ['Hubli City', 'Gabbur', 'Keshwapur', 'Navanagar', 'Tarihal', 'Unkal'],
  'Kalghatgi': ['Kalghatgi Town', 'Annigeri', 'Dharwad Road', 'Hangal Road', 'Savanur Road'],
  'Kundgol': ['Kundgol Town', 'Amminabhavi', 'Belur', 'Hubli Road', 'Karajagi'],
  'Navalgund': ['Navalgund Town', 'Annigeri', 'Dharwad Road', 'Garag', 'Shirol'],

  // Gadag
  'Gadag': ['Gadag City', 'Betgeri', 'Hombal', 'Hulkoti', 'Lakkundi', 'Mundargi'],
  'Mundargi': ['Mundargi Town', 'Motebennur', 'Nesargi', 'Ron', 'Shishuvinala'],
  'Nargund': ['Nargund Town', 'Dambal', 'Kannur', 'Kurjala', 'Polali'],
  'Ron': ['Ron Town', 'Chikkerur', 'Gajendragad', 'Hole Alur', 'Kuknur'],
  'Shirhatti': ['Shirhatti Town', 'Hole Alur', 'Hosur', 'Lakhmeshwar', 'Soratur'],

  // Hassan
  'Hassan': ['Hassan City', 'Arasikere', 'Doddamagge', 'Gorur', 'Hirisave', 'Sakleshpur Road'],
  'Alur': ['Alur Town', 'Doddamagge', 'Hiremagalur', 'Kodlipet', 'Turuvekere'],
  'Arakalagudu': ['Arakalagudu Town', 'Basavanahalli', 'Bettadapura', 'Hanagodu', 'Kallu'],
  'Arkalgud': ['Arkalgud Town', 'Javagal', 'Kittane', 'Malavalli', 'Nuggehalli'],
  'Belur': ['Belur Town', 'Doddapete', 'Halebidu', 'Kambathahalli', 'Nuggehalli'],
  'Channarayapatna': ['Channarayapatna Town', 'Dudda', 'Hirisave', 'Hosahalli', 'Yediyur'],
  'Holenarasipur': ['Holenarasipur Town', 'Bannikuppe', 'Dodda Belur', 'Hemavathi', 'Shravanabelagola'],
  'Sakleshpur': ['Sakleshpur Town', 'Arehalli', 'Bisale', 'Donigal', 'Yeslur'],

  // Haveri
  'Haveri': ['Haveri Town', 'Chabbi', 'Hosayellapur', 'Kaginele', 'Kushtalagi', 'Shiggaon Road'],
  'Byadgi': ['Byadgi Town', 'Dombar', 'Hanumansagara', 'Medleri', 'Ranebennur Road'],
  'Hanagal': ['Hanagal Town', 'Guttal', 'Hirehal', 'Motebennur', 'Tadas'],
  'Hirekerur': ['Hirekerur Town', 'Chikkerur', 'Harlapur', 'Kadkol', 'Rona'],
  'Ranebennur': ['Ranebennur Town', 'Guttur', 'Hiredodderi', 'Jagalur Road', 'Tadakod'],
  'Savanur': ['Savanur Town', 'Bankapur', 'Binkadakatti', 'Hiresave', 'Saunshi'],
  'Shiggaon': ['Shiggaon Town', 'Angadihalli', 'Karajagi', 'Savalagi', 'Yavagal'],

  // Kalaburagi
  'Kalaburagi': ['Kalaburagi City', 'Aland Road', 'Ashraya Nagar', 'Bhosga', 'Brundavan Nagar', 'Settur'],
  'Afzalpur': ['Afzalpur Town', 'Bolegaon', 'Chakalsur', 'Hirekodi', 'Nilgund'],
  'Aland': ['Aland Town', 'Ganagapur', 'Havagi', 'Nandur', 'Wadagera'],
  'Chincholi': ['Chincholi Town', 'Bhaskarnagar', 'Gundoor', 'Kakkera', 'Molkalmur'],
  'Chittapur': ['Chittapur Town', 'Basarkallu', 'Kagina', 'Nandur', 'Wadagera'],
  'Jevargi': ['Jevargi Town', 'Dambala', 'Honagera', 'Korwar', 'Mashal'],
  'Sedam': ['Sedam Town', 'Gudur', 'Honagera', 'Malkheda', 'Nandgaon'],

  // Kodagu
  'Madikeri': ['Madikeri Town', 'Ayyangeri', 'Bhagamandala', 'Galibeedu', 'Napoklu', 'Virajpet Road'],
  'Somwarpet': ['Somwarpet Town', 'Ammathi', 'Bittangala', 'Kushalnagar', 'Shanivasara', 'Siddapura'],
  'Virajpet': ['Virajpet Town', 'Ammathi', 'Gonikoppal', 'Hudikeri', 'Kutta', 'Ponnampet'],

  // Kolar
  'Kolar': ['Kolar City', 'Bethamangala', 'Chinthamani Road', 'Mutturu', 'Nangali', 'Srinivaspur Road'],
  'Bangarpet': ['Bangarpet Town', 'Antaragange', 'Gudibanda', 'Nidaghatta', 'Ovalu'],
  'KGF (Kolar Gold Fields)': ['KGF Town', 'Champion Reef', 'Oorgaum', 'Robertsonpet', 'Tambuchetty'],
  'Malur': ['Malur Town', 'Arasanahalli', 'Bettahalasur', 'Kamasamudra', 'Settihalli'],
  'Mulbagal': ['Mulbagal Town', 'Avani', 'Gudibanda', 'Manchenahalli', 'Sonnathambenahalli'],
  'Srinivaspur': ['Srinivaspur Town', 'Manchenahalli', 'Motamarri', 'Pathapalya', 'Varlakonda'],

  // Koppal
  'Koppal': ['Koppal City', 'Bevoor', 'Ginigera', 'Hirebidari', 'Kustagi Road', 'Marali'],
  'Gangavathi': ['Gangavathi Town', 'Hampi', 'Hosapete Road', 'Karatagi', 'Malebennur', 'Vadderhatti'],
  'Kushtagi': ['Kushtagi Town', 'Bevoor', 'Hireguntanur', 'Hosakera', 'Malaghan'],
  'Yelburga': ['Yelburga Town', 'Kanakagiri', 'Kukanavalli', 'Naragund', 'Tungabhadra'],

  // Mandya
  'Mandya': ['Mandya City', 'Byramangala', 'Dudda', 'Keragodu', 'Shivapura', 'Vijayanagara'],
  'Krishnarajapete': ['KR Pete Town', 'Bherya', 'Belakavadi', 'Gejjalagere', 'Nagamangala Road'],
  'Maddur': ['Maddur Town', 'Bellur Cross', 'Koppa', 'Nagamangala Road', 'Sathanur'],
  'Malavalli': ['Malavalli Town', 'Basarakodu', 'Kollegala Road', 'Kooragodu', 'Sangama'],
  'Nagamangala': ['Nagamangala Town', 'Bellur', 'Dudda', 'Kadakola', 'Somanahalli'],
  'Pandavapura': ['Pandavapura Town', 'Belagola', 'Chikkarayapura', 'Melukote', 'Tonnur'],
  'Srirangapatna': ['Srirangapatna Town', 'Ganjam', 'Karighatta', 'Sivasamudram', 'Tenginakoppa'],

  // Mysuru
  'Mysuru': ['Mysuru City', 'Bannur', 'Bogadi', 'Chamundeshwari', 'Hebbal', 'Hinkal', 'Jayapura', 'Kadakola', 'Varuna'],
  'HD Kote': ['HD Kote Town', 'Antarsante', 'Hediyala', 'Kallahalli', 'Nagarahole'],
  'Heggadadevankote': ['HDK Town', 'Bilikere', 'Hanagodu', 'Kabini', 'Kalkere'],
  'Hunsur': ['Hunsur Town', 'Arkanahalli', 'Bettadapura', 'Javagal', 'Kodagu Road'],
  'Krishnarajanagara': ['KR Nagara Town', 'Arakere', 'Hanagodu', 'Nagapura', 'Uttanahalli'],
  'Nanjangud': ['Nanjangud Town', 'Hampapura', 'Hediyala', 'Kadaganchi', 'Tagadur'],
  'Periyapatna': ['Periyapatna Town', 'Gonikoppal Road', 'Kenchanahalli', 'Mellahalli', 'Yedur'],
  'TN Pura': ['TN Pura Town', 'Bastipura', 'Bekur', 'Haradanahalli', 'Maralur'],

  // Raichur
  'Raichur': ['Raichur City', 'Arakera', 'Deosugur', 'Jakapur', 'Kavital', 'Yeragera'],
  'Devadurga': ['Devadurga Town', 'Arkera', 'Devara Hippargi', 'Kallur', 'Talikote'],
  'Lingsugur': ['Lingsugur Town', 'Hanchinal', 'Mundargi', 'Raichur Road', 'Yaragutti'],
  'Manvi': ['Manvi Town', 'Gabbur', 'Kavithal', 'Kunikeri', 'Yaragera'],
  'Mudugal': ['Mudugal Town', 'Irkalgad', 'Machapur', 'Sindhanur Road', 'Yeragera'],
  'Sindhanur': ['Sindhanur Town', 'Gangavathi Road', 'Maski', 'Ragavendra Colony', 'Turuvihal'],

  // Ramanagara
  'Ramanagara': ['Ramanagara Town', 'Bidadi', 'Chikkanahalli', 'Harohalli', 'Uragahalli'],
  'Channapatna': ['Channapatna Town', 'Hejjala', 'Maddur Road', 'Sangama', 'Solur'],
  'Kanakapura': ['Kanakapura Town', 'Dodda Alada Mara', 'Harohalli', 'Manchanabele', 'Thattekere'],
  'Magadi': ['Magadi Town', 'Dobbaspete', 'Doddaballapura Road', 'Manchanabele', 'Solur'],

  // Shivamogga
  'Shivamogga': ['Shivamogga City', 'Bhadravati', 'Koppa Road', 'Sagara Road', 'Thirthahalli Road', 'Vinoba Nagar'],
  'Bhadravati': ['Bhadravati Town', 'Challakere', 'Holehonnur', 'Shivamogga Road', 'Talaguppa'],
  'Hosanagara': ['Hosanagara Town', 'Agumbe', 'Aramballi', 'Kalasa Road', 'Nilkodu'],
  'Sagara': ['Sagara Town', 'Gajanur', 'Ikkeri', 'Keladi', 'Talaguppa'],
  'Shikaripura': ['Shikaripura Town', 'Anandapura', 'Belagutti', 'Huvina Hadagali', 'Soraba Road'],
  'Sorab': ['Sorab Town', 'Haliyala', 'Hirebidari', 'Honnavara', 'Sirsi Road'],
  'Tirthahalli': ['Tirthahalli Town', 'Agumbe', 'Hattikudru', 'Kuppalli', 'Shimoga Road'],

  // Tumakuru
  'Tumakuru': ['Tumakuru City', 'Antaragange', 'Gubbi Road', 'Koratagere Road', 'Pavagada Road', 'Tiptur Road'],
  'Chiknayakanhalli': ['CNH Town', 'Belagur', 'Channarayapatna Road', 'Honnali Road', 'Kyathsandra'],
  'Gubbi': ['Gubbi Town', 'Hattikuduru', 'Hiriyur Road', 'Koratagere Road', 'Thirthahalli'],
  'Koratagere': ['Koratagere Town', 'Gouribidanur Road', 'Honnali', 'Madhugiri Road', 'Sira Road'],
  'Kunigal': ['Kunigal Town', 'Kyathasandra', 'Nagavalli', 'Nidaghatta', 'Yediyur'],
  'Madhugiri': ['Madhugiri Town', 'Hebburu', 'Hirehalli', 'Koratagere Road', 'Tumkur Road'],
  'Pavagada': ['Pavagada Town', 'Bheemasandra', 'Devalapur', 'Narasapura', 'Sira Road'],
  'Sira': ['Sira Town', 'Amasebalu', 'Hebburu', 'Huliyar', 'Koratagere Road'],
  'Tiptur': ['Tiptur Town', 'Anagavadi', 'Gubbi Road', 'Shantigrama', 'Turuvekere Road'],
  'Turuvekere': ['Turuvekere Town', 'Arasikere Road', 'Channarayapatna Road', 'Hassan Road', 'Hiriyur Road'],

  // Udupi
  'Udupi': ['Udupi Town', 'Brahmawar', 'Innanje', 'Kaup', 'Manipal', 'Padubidri', 'Perdoor'],
  'Karkala': ['Karkala Town', 'Amasebailu', 'Belman', 'Hirebettu', 'Muduvidre', 'Shirva'],
  'Kundapur': ['Kundapur Town', 'Bhatkal Road', 'Gangolli', 'Koteshwara', 'Malpe', 'Trasi'],

  // Uttara Kannada
  'Karwar': ['Karwar Town', 'Baad', 'Chandavar', 'Devbagh', 'Kodibag', 'Sadashivgad'],
  'Ankola': ['Ankola Town', 'Belekeri', 'Kagal', 'Majali', 'Shirali'],
  'Bhatkal': ['Bhatkal Town', 'Baad', 'Mavinakurve', 'Murudeshwara', 'Sharavathi'],
  'Dandeli': ['Dandeli Town', 'Haliyal Road', 'Joida', 'Shivapura', 'Ulavi'],
  'Haliyal': ['Haliyal Town', 'Dandeli Road', 'Mundgod Road', 'Supa', 'Ulavi'],
  'Honavar': ['Honavar Town', 'Bhatkal Road', 'Kumta Road', 'Manchikeri', 'Tadri'],
  'Joida': ['Joida Town', 'Amboli', 'Dandeli Road', 'Kaneri', 'Kulgi'],
  'Kumta': ['Kumta Town', 'Gokarna', 'Hedgaon', 'Masur', 'Mirjan'],
  'Mundgod': ['Mundgod Town', 'Haliyal Road', 'Hubli Road', 'Sirsi Road', 'Yellapur Road'],
  'Siddapur': ['Siddapur Town', 'Badagandi', 'Govindapura', 'Hangal Road', 'Yellapur Road'],
  'Sirsi': ['Sirsi Town', 'Bhatkal Road', 'Hulical', 'Malemane', 'Sonda', 'Yadgod'],
  'Yellapur': ['Yellapur Town', 'Dhandeli Road', 'Mundgod Road', 'Siddapur Road', 'Supa'],

  // Vijayapura
  'Vijayapura': ['Vijayapura City', 'Almel', 'Babalad', 'Indi Road', 'Muddebihal Road', 'Talikoti'],
  'Basavana Bagewadi': ['BB Town', 'Horti', 'Hungund Road', 'Jambagi', 'Muddebihal Road'],
  'Indi': ['Indi Town', 'Bableshwar', 'Ingligi', 'Muddebihal Road', 'Vijayapura Road'],
  'Muddebihal': ['Muddebihal Town', 'Indi Road', 'Sindagi Road', 'Talikote', 'Vijayapura Road'],
  'Sindagi': ['Sindagi Town', 'Devar Hippargi', 'Muddebihal Road', 'Tamadihalli', 'Vijayapura Road'],

  // Yadgir
  'Yadgir': ['Yadgir City', 'Bhima River', 'Chandgad', 'Ganagapur Road', 'Malkheda', 'Wadi'],
  'Gurumitkal': ['Gurumitkal Town', 'Bhima', 'Gurmitkal', 'Narayanapura', 'Yadgir Road'],
  'Shahapur': ['Shahapur Town', 'Devara Hippargi', 'Kembhavi', 'Mudnal', 'Shorapur Road'],
  'Shorapur': ['Shorapur Town', 'Hunsagi', 'Kembhavi', 'Shiva Camp', 'Yadgir Road'],
};
