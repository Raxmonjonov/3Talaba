export interface UniversityItem {
  rank: number;
  name: string;
  country: string;
  tier: "TOP_10" | "TOP_50" | "TOP_100" | "TOP_300";
}

const RAW_TOP_300_LIST = `
1. Massachusetts Institute of Technology (MIT) - AQSH
2. Imperial College London - Buyuk Britaniya
3. Stanford University - AQSH
4. University of Oxford - Buyuk Britaniya
5. Harvard University - AQSH
6. University of Cambridge - Buyuk Britaniya
7. California Institute of Technology (Caltech) - AQSH
8. ETH Zurich - Shveytsariya
9. UCL (University College London) - Buyuk Britaniya
10. National University of Singapore (NUS) - Singapur
11. The University of Hong Kong (HKU) - Gonkong
12. Nanyang Technological University (NTU) - Singapur
13. Peking University - Xitoy
14. Tsinghua University - Xitoy
15. University of Pennsylvania - AQSH
16. Cornell University - AQSH
17. Yale University - AQSH
18. The Chinese University of Hong Kong (CUHK) - Gonkong
19. The University of New South Wales (UNSW Sydney) - Avstraliya
20. Johns Hopkins University - AQSH
21. University of California, Berkeley (UCB) - AQSH
22. The University of Melbourne - Avstraliya
23. The University of Sydney - Avstraliya
24. Princeton University - AQSH
25. University of Chicago - AQSH
26. Columbia University - AQSH
27. The University of Tokyo - Yaponiya
28. Seoul National University (SNU) - Janubiy Koreya
29. University of Toronto - Kanada
30. McGill University - Kanada
31. University of Michigan-Ann Arbor - AQSH
32. Australian National University (ANU) - Avstraliya
33. Université PSL - Fransiya
34. Technical University of Munich (TUM) - Germaniya
35. EPFL (École Polytechnique Fédérale de Lausanne) - Shveytsariya
36. University of Edinburgh - Buyuk Britaniya
37. The University of Manchester - Buyuk Britaniya
38. Monash University - Avstraliya
39. The University of Queensland - Avstraliya
40. Fudan University - Xitoy
41. Zhejiang University - Xitoy
42. Shanghai Jiao Tong University - Xitoy
43. King's College London - Buyuk Britaniya
44. University of California, Los Angeles (UCLA) - AQSH
45. New York University (NYU) - AQSH
46. Northwestern University - AQSH
47. University of British Columbia - Kanada
48. The Hong Kong University of Science and Technology (HKUST) - Gonkong
49. Institut Polytechnique de Paris - Fransiya
50. Delft University of Technology - Niderlandiya
51. Kyoto University - Yaponiya
52. Yonsei University - Janubiy Koreya
53. KAIST - Korea Advanced Institute of Science & Technology - Janubiy Koreya
54. London School of Economics and Political Science (LSE) - Buyuk Britaniya
55. University of Bristol - Buyuk Britaniya
56. Ludwig-Maximilians-Universität München (LMU) - Germaniya
57. University of Amsterdam - Niderlandiya
58. Duke University - AQSH
59. University of Texas at Austin - AQSH
60. Korea University - Janubiy Koreya
61. Sorbonne University - Fransiya
62. The Hong Kong Polytechnic University - Gonkong
63. University of Illinois at Urbana-Champaign - AQSH
64. University of California, San Diego (UCSD) - AQSH
65. City University of Hong Kong (CityUHK) - Gonkong
66. Universiti Malaya (UM) - Malayziya
67. The University of Warwick - Buyuk Britaniya
68. KU Leuven - Belgiya
69. University of Auckland - Yangi Zelandiya
70. National Taiwan University (NTU) - Tayvan
71. University of Washington - AQSH
72. University of Glasgow - Buyuk Britaniya
73. Brown University - AQSH
74. Universität Heidelberg - Germaniya
75. University of Leeds - Buyuk Britaniya
76. University of Southampton - Buyuk Britaniya
77. University of Birmingham - Buyuk Britaniya
78. University of Western Australia - Avstraliya
79. University of Adelaide - Avstraliya
80. Osaka University - Yaponiya
81. Tokyo Institute of Technology - Yaponiya
82. Lund University - Shvetsiya
83. KTH Royal Institute of Technology - Shvetsiya
84. University of Zurich - Shveytsariya
85. University of Copenhagen - Daniya
86. Lomonosov Moscow State University - Rossiya
87. University of Science and Technology of China (USTC) - Xitoy
88. University of North Carolina at Chapel Hill - AQSH
89. Durham University - Buyuk Britaniya
90. University of Sheffield - Buyuk Britaniya
91. Pennsylvania State University - AQSH
92. Purdue University - AQSH
93. University of St Andrews - Buyuk Britaniya
94. University of Nottingham - Buyuk Britaniya
95. Trinity College Dublin - Irlandiya
96. Universidade de São Paulo (USP) - Braziliya
97. Universidad de Buenos Aires (UBA) - Argentina
98. King Fahd University of Petroleum & Minerals (KFUPM) - Saudiya Arabistoni
99. University of Alberta - Kanada
100. Politecnico di Milano - Italiya
101. University of Southern California (USC) - AQSH
102. University of Technology Sydney (UTS) - Avstraliya
103. Georgia Institute of Technology - AQSH
104. Université Paris-Saclay - Fransiya
105. University of Waterloo - Kanada
106. Freie Universitaet Berlin - Germaniya
107. RWTH Aachen University - Germaniya
108. Karlsruhe Institute of Technology (KIT) - Germaniya
109. Humboldt-Universität zu Berlin - Germaniya
110. University of Helsinki - Finlyandiya
111. Utrecht University - Niderlandiya
112. University of Oslo - Norvegiya
113. Chalmers University of Technology - Shvetsiya
114. Technical University of Denmark (DTU) - Daniya
115. Uppsala University - Shvetsiya
116. Leiden University - Niderlandiya
117. Eindhoven University of Technology - Niderlandiya
118. University of Groningen - Niderlandiya
119. Queen Mary University of London - Buyuk Britaniya
120. Newcastle University - Buyuk Britaniya
121. Lancaster University - Buyuk Britaniya
122. University of York - Buyuk Britaniya
123. Cardiff University - Buyuk Britaniya
124. University of Exeter - Buyuk Britaniya
125. University of Bath - Buyuk Britaniya
126. University of Liverpool - Buyuk Britaniya
127. University of Reading - Buyuk Britaniya
128. University of Sussex - Buyuk Britaniya
129. Loughborough University - Buyuk Britaniya
130. University of Sheffield - Buyuk Britaniya
131. Boston University - AQSH
132. Ohio State University - AQSH
133. University of California, Davis (UC Davis) - AQSH
134. University of California, Santa Barbara (UCSB) - AQSH
135. University of Wisconsin-Madison - AQSH
136. University of Florida - AQSH
137. Texas A&M University - AQSH
138. University of Maryland, College Park - AQSH
139. University of Minnesota Twin Cities - AQSH
140. Rice University - AQSH
141. Vanderbilt University - AQSH
142. Washington University in St. Louis - AQSH
143. Emory University - AQSH
144. University of Pittsburgh - AQSH
145. Michigan State University - AQSH
146. Arizona State University - AQSH
147. University of Rochester - AQSH
148. Dartmouth College - AQSH
149. Case Western Reserve University - AQSH
150. Georgetown University - AQSH
151. Western University - Kanada
152. Université de Montréal - Kanada
153. McMaster University - Kanada
154. University of Calgary - Kanada
155. University of Ottawa - Kanada
156. Queen's University at Kingston - Kanada
157. Dalhousie University - Kanada
158. RMIT University - Avstraliya
159. Macquarie University - Avstraliya
160. University of Wollongong - Avstraliya
161. Curtin University - Avstraliya
162. Queensland University of Technology (QUT) - Avstraliya
163. Deakin University - Avstraliya
164. Newcastle University (Australia) - Avstraliya
165. Tohoku University - Yaponiya
166. Nagoya University - Yaponiya
167. Kyushu University - Yaponiya
168. Hokkaido University - Yaponiya
169. Waseda University - Yaponiya
170. Keio University - Yaponiya
171. Pohang University of Science And Technology (POSTECH) - Janubiy Koreya
172. Sungkyunkwan University (SKKU) - Janubiy Koreya
173. Hanyang University - Janubiy Koreya
174. Kyung Hee University - Janubiy Koreya
175. Nanjing University - Xitoy
176. Wuhan University - Xitoy
177. Tongji University - Xitoy
178. Harbin Institute of Technology - Xitoy
179. Beijing Normal University - Xitoy
180. Huazhong University of Science and Technology - Xitoy
181. Sun Yat-sen University - Xitoy
182. Universiti Kebangsaan Malaysia (UKM) - Malayziya
183. Universiti Sains Malaysia (USM) - Malayziya
184. Universiti Putra Malaysia (UPM) - Malayziya
185. Universiti Teknologi Malaysia (UTM) - Malayziya
186. King Abdulaziz University (KAU) - Saudiya Arabistoni
187. King Saud University - Saudiya Arabistoni
188. Khalifa University - BAA
189. United Arab Emirates University - BAA
190. Qatar University - Qatar
191. Indian Institute of Technology Bombay (IITB) - Hindiston
192. Indian Institute of Technology Delhi (IITD) - Hindiston
193. Indian Institute of Science (IISc) - Hindiston
194. Alma Mater Studiorum - Università di Bologna - Italiya
195. Sapienza University of Rome - Italiya
196. Politecnico di Torino - Italiya
197. Universitat de Barcelona - Ispaniya
198. Universidad Autónoma de Madrid - Ispaniya
199. University of Vienna - Avstriya
200. Ghent University - Belgiya
201. University of Basel - Shveytsariya
202. University of Geneva - Shveytsariya
203. University of Bern - Shveytsariya
204. University of Lausanne - Shveytsariya
205. Technische Universität Berlin (TU Berlin) - Germaniya
206. Technische Universität Dresden - Germaniya
207. University of Tübingen - Germaniya
208. University of Freiburg - Germaniya
209. University of Göttingen - Germaniya
210. University of Hamburg - Germaniya
211. University of Bonn - Germaniya
212. University of Cologne - Germaniya
213. Wageningen University & Research - Niderlandiya
214. Radboud University - Niderlandiya
215. Erasmus University Rotterdam - Niderlandiya
216. Vrije Universiteit Amsterdam - Niderlandiya
217. Maastricht University - Niderlandiya
218. University of Twente - Niderlandiya
219. Aarhus University - Daniya
220. Stockholm University - Shvetsiya
221. University of Gothenburg - Shvetsiya
222. University of Bergen - Norvegiya
223. Norwegian University of Science And Technology - Norvegiya
224. Aalto University - Finlyandiya
225. University College Dublin - Irlandiya
226. University of Galway - Irlandiya
227. University College Cork - Irlandiya
228. Université Catholique de Louvain (UCLouvain) - Belgiya
229. University of Antwerp - Belgiya
230. Vrije Universiteit Brussel (VUB) - Belgiya
231. Technische Universität Wien - Avstriya
232. University of Innsbruck - Avstriya
233. University of Padua - Italiya
234. University of Milan - Italiya
235. University of Turin - Italiya
236. University of Pisa - Italiya
237. University of Florence - Italiya
238. University of Naples - Federico II - Italiya
239. Universitat Autònoma de Barcelona - Ispaniya
240. Complutense University of Madrid - Ispaniya
241. Pompeu Fabra University (Barcelona) - Ispaniya
242. Universidad Carlos III de Madrid (UC3M) - Ispaniya
243. Universitat Politècnica de Catalunya · BarcelonaTech (UPC) - Ispaniya
244. University of Navarra - Ispaniya
245. University of Lisbon - Portugaliya
246. University of Porto - Portugaliya
247. University of Warsaw - Polsha
248. Jagiellonian University - Polsha
249. Charles University - Chexiya
250. University of Aberdeen - Buyuk Britaniya
251. Queen's University Belfast - Buyuk Britaniya
252. University of Strathclyde - Buyuk Britaniya
253. Heriot-Watt University - Buyuk Britaniya
254. University of Surrey - Buyuk Britaniya
255. University of Leicester - Buyuk Britaniya
256. Swansea University - Buyuk Britaniya
257. University of East Anglia (UEA) - Buyuk Britaniya
258. Brunel University London - Buyuk Britaniya
259. City, University of London - Buyuk Britaniya
260. Oxford Brookes University - Buyuk Britaniya
261. University of Virginia - AQSH
262. University of Southern California - AQSH
263. Tufts University - AQSH
264. University of Notre Dame - AQSH
265. University of California, Irvine (UCI) - AQSH
266. University of Massachusetts Amherst - AQSH
267. University of Colorado Boulder - AQSH
268. Virginia Polytechnic Institute and State University - AQSH
269. North Carolina State University - AQSH
270. Indiana University Bloomington - AQSH
271. Rutgers University–New Brunswick - AQSH
272. University of Arizona - AQSH
273. Northeastern University - AQSH
274. University of Miami - AQSH
275. George Washington University - AQSH
276. University of Illinois Chicago (UIC) - AQSH
277. University of Iowa - AQSH
278. University of Utah - AQSH
279. Simon Fraser University - Kanada
280. University of Victoria (UVic) - Kanada
281. York University - Kanada
282. Concordia University - Kanada
283. Université Laval - Kanada
284. University of Saskatchewan - Kanada
285. Griffith University - Avstraliya
286. La Trobe University - Avstraliya
287. Swinburne University of Technology - Avstraliya
288. University of Tasmania - Avstraliya
289. Flinders University - Avstraliya
290. University of South Australia - Avstraliya
291. University of Otago - Yangi Zelandiya
292. Victoria University of Wellington - Yangi Zelandiya
293. University of Canterbury - Yangi Zelandiya
294. Massey University - Yangi Zelandiya
295. University of Waikato - Yangi Zelandiya
296. Tsukuba University - Yaponiya
297. Hiroshima University - Yaponiya
298. Kobe University - Yaponiya
299. Hitotsubashi University - Yaponiya
300. Tokyo Medical and Dental University (TMDU) - Yaponiya
`;

function getTier(rank: number): UniversityItem["tier"] {
  if (rank <= 10) return "TOP_10";
  if (rank <= 50) return "TOP_50";
  if (rank <= 100) return "TOP_100";
  return "TOP_300";
}

export const TOP_300_UNIVERSITIES: UniversityItem[] = RAW_TOP_300_LIST.trim()
  .split("\n")
  .map((line) => {
    const trimmed = line.trim();
    const dotIdx = trimmed.indexOf(".");
    const rank = Number(trimmed.slice(0, dotIdx).trim());
    const rest = trimmed.slice(dotIdx + 1).trim();
    const sepIdx = rest.lastIndexOf(" - ");
    const name = sepIdx >= 0 ? rest.slice(0, sepIdx).trim() : rest;
    const country = sepIdx >= 0 ? rest.slice(sepIdx + 3).trim() : "Xalqaro";
    return {
      rank,
      name,
      country,
      tier: getTier(rank),
    };
  });

export const COUNTRY_CODES: Record<string, string> = {
  AQSH: "US",
  "Buyuk Britaniya": "GB",
  Shveytsariya: "CH",
  Singapur: "SG",
  Gonkong: "HK",
  Xitoy: "CN",
  Avstraliya: "AU",
  Yaponiya: "JP",
  "Janubiy Koreya": "KR",
  Kanada: "CA",
  Fransiya: "FR",
  Germaniya: "DE",
  Niderlandiya: "NL",
  Malayziya: "MY",
  Belgiya: "BE",
  "Yangi Zelandiya": "NZ",
  Tayvan: "TW",
  Shvetsiya: "SE",
  Daniya: "DK",
  Rossiya: "RU",
  Irlandiya: "IE",
  Braziliya: "BR",
  Argentina: "AR",
  "Saudiya Arabistoni": "SA",
  Italiya: "IT",
  Finlyandiya: "FI",
  Norvegiya: "NO",
  BAA: "AE",
  Qatar: "QA",
  Hindiston: "IN",
  Ispaniya: "ES",
  Avstriya: "AT",
  Portugaliya: "PT",
  Polsha: "PL",
  Chexiya: "CZ",
};

export const UNIVERSITY_COUNTRIES: Array<{ country: string; count: number; code: string }> =
  Array.from(
    TOP_300_UNIVERSITIES.reduce((acc, u) => {
      acc.set(u.country, (acc.get(u.country) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .map(([country, count]) => ({
      country,
      count,
      code: COUNTRY_CODES[country] ?? "GL",
    }))
    .sort((a, b) => b.count - a.count);

export function findUniversityByRank(rank: number): UniversityItem | undefined {
  return TOP_300_UNIVERSITIES.find((u) => u.rank === rank);
}

export function filterUniversities(options: {
  query?: string;
  country?: string;
  tier?: "ALL" | UniversityItem["tier"];
}): UniversityItem[] {
  const q = (options.query ?? "").trim().toLowerCase();
  const country = (options.country ?? "ALL").trim();
  const tier = options.tier ?? "ALL";

  return TOP_300_UNIVERSITIES.filter((u) => {
    if (country !== "ALL" && u.country !== country) return false;
    if (tier !== "ALL") {
      if (tier === "TOP_10" && u.rank > 10) return false;
      if (tier === "TOP_50" && u.rank > 50) return false;
      if (tier === "TOP_100" && u.rank > 100) return false;
    }
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q) ||
      String(u.rank) === q ||
      `#${u.rank}` === q
    );
  });
}
