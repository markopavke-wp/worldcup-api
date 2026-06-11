// FIFA World Cup 2026 — raspored (group stage + knockout)
// Format: id|date|timeEST|home|away|groupOrStage
export const FIXTURE_ROWS = `
1|11-Jun-26|15:00|Mexico|South Africa|A
2|11-Jun-26|22:00|Korea Republic|Czechia|A
3|12-Jun-26|15:00|Canada|Bosnia and Herzegovina|B
4|12-Jun-26|21:00|United States|Paraguay|D
5|13-Jun-26|21:00|Haiti|Scotland|C
6|13-Jun-26|00:00|Australia|Türkiye|D
7|13-Jun-26|18:00|Brazil|Morocco|C
8|13-Jun-26|15:00|Qatar|Switzerland|B
9|14-Jun-26|19:00|Côte d'Ivoire|Ecuador|E
10|14-Jun-26|13:00|Germany|Curaçao|E
11|14-Jun-26|16:00|Netherlands|Japan|F
12|14-Jun-26|22:00|Sweden|Tunisia|F
13|15-Jun-26|18:00|Saudi Arabia|Uruguay|H
14|15-Jun-26|12:00|Spain|Cabo Verde|H
15|15-Jun-26|21:00|IR Iran|New Zealand|G
16|15-Jun-26|15:00|Belgium|Egypt|G
17|16-Jun-26|15:00|France|Senegal|I
18|16-Jun-26|18:00|Iraq|Norway|I
19|16-Jun-26|21:00|Argentina|Algeria|J
20|16-Jun-26|00:00|Austria|Jordan|J
21|17-Jun-26|19:00|Ghana|Panama|L
22|17-Jun-26|16:00|England|Croatia|L
23|17-Jun-26|13:00|Portugal|Congo DR|K
24|17-Jun-26|22:00|Uzbekistan|Colombia|K
25|18-Jun-26|12:00|Czechia|South Africa|A
26|18-Jun-26|15:00|Switzerland|Bosnia and Herzegovina|B
27|18-Jun-26|18:00|Canada|Qatar|B
28|18-Jun-26|21:00|Mexico|Korea Republic|A
29|19-Jun-26|21:00|Brazil|Haiti|C
30|19-Jun-26|18:00|Scotland|Morocco|C
31|19-Jun-26|23:00|Türkiye|Paraguay|D
32|19-Jun-26|15:00|United States|Australia|D
33|20-Jun-26|16:00|Germany|Côte d'Ivoire|E
34|20-Jun-26|20:00|Ecuador|Curaçao|E
35|20-Jun-26|13:00|Netherlands|Sweden|F
36|20-Jun-26|00:00|Tunisia|Japan|F
37|21-Jun-26|18:00|Uruguay|Cabo Verde|H
38|21-Jun-26|12:00|Spain|Saudi Arabia|H
39|21-Jun-26|15:00|Belgium|IR Iran|G
40|21-Jun-26|21:00|New Zealand|Egypt|G
41|22-Jun-26|20:00|Norway|Senegal|I
42|22-Jun-26|17:00|France|Iraq|I
43|22-Jun-26|13:00|Argentina|Austria|J
44|22-Jun-26|23:00|Jordan|Algeria|J
45|23-Jun-26|16:00|England|Ghana|L
46|23-Jun-26|19:00|Panama|Croatia|L
47|23-Jun-26|13:00|Portugal|Uzbekistan|K
48|23-Jun-26|22:00|Colombia|Congo DR|K
49|24-Jun-26|18:00|Scotland|Brazil|C
50|24-Jun-26|18:00|Morocco|Haiti|C
51|24-Jun-26|15:00|Switzerland|Canada|B
52|24-Jun-26|15:00|Bosnia and Herzegovina|Qatar|B
53|24-Jun-26|21:00|Czechia|Mexico|A
54|24-Jun-26|21:00|South Africa|Korea Republic|A
55|25-Jun-26|16:00|Curaçao|Côte d'Ivoire|E
56|25-Jun-26|16:00|Ecuador|Germany|E
57|25-Jun-26|19:00|Japan|Sweden|F
58|25-Jun-26|19:00|Tunisia|Netherlands|F
59|25-Jun-26|22:00|Türkiye|United States|D
60|25-Jun-26|22:00|Paraguay|Australia|D
61|26-Jun-26|15:00|Norway|France|I
62|26-Jun-26|15:00|Senegal|Iraq|I
63|26-Jun-26|23:00|Egypt|IR Iran|G
64|26-Jun-26|23:00|New Zealand|Belgium|G
65|26-Jun-26|20:00|Cabo Verde|Saudi Arabia|H
66|26-Jun-26|20:00|Uruguay|Spain|H
67|27-Jun-26|17:00|Panama|England|L
68|27-Jun-26|17:00|Croatia|Ghana|L
69|27-Jun-26|22:00|Algeria|Austria|J
70|27-Jun-26|22:00|Jordan|Argentina|J
71|27-Jun-26|19:30|Colombia|Portugal|K
72|27-Jun-26|19:30|Congo DR|Uzbekistan|K
73|28-Jun-26|15:00|Group A Runners Up|Group B Runners Up|Round of 32
74|29-Jun-26|16:30|Group E Winners|Best 3rd Place|Round of 32
75|29-Jun-26|21:00|Group F Winners|Group C Runners Up|Round of 32
76|29-Jun-26|13:00|Group C Winners|Group F Runners Up|Round of 32
77|30-Jun-26|17:00|Group I Winners|Best 3rd Place|Round of 32
78|30-Jun-26|13:00|Group E Runners Up|Group I Runners Up|Round of 32
79|30-Jun-26|21:00|Group A Winners|Best 3rd Place|Round of 32
80|1-Jul-26|12:00|Group L Winners|Best 3rd Place|Round of 32
81|1-Jul-26|20:00|Group D Winners|Best 3rd Place|Round of 32
82|1-Jul-26|16:00|Group G Winners|Best 3rd Place|Round of 32
83|2-Jul-26|19:00|Group K Runners Up|Group L Runners Up|Round of 32
84|2-Jul-26|15:00|Group H Winners|Group J Runners Up|Round of 32
85|2-Jul-26|23:00|Group B Winners|Best 3rd Place|Round of 32
86|3-Jul-26|18:00|Group J Winners|Group H Runners Up|Round of 32
87|3-Jul-26|21:30|Group K Winners|Best 3rd Place|Round of 32
88|3-Jul-26|14:00|Group D Runners Up|Group G Runners Up|Round of 32
89|4-Jul-26|17:00|Match 74 Winner|Match 77 Winner|Round of 16
90|4-Jul-26|13:00|Match 73 Winner|Match 75 Winner|Round of 16
91|5-Jul-26|16:00|Match 76 Winner|Match 78 Winner|Round of 16
92|5-Jul-26|20:00|Match 79 Winner|Match 80 Winner|Round of 16
93|6-Jul-26|15:00|Match 83 Winner|Match 84 Winner|Round of 16
94|6-Jul-26|20:00|Match 81 Winner|Match 82 Winner|Round of 16
95|7-Jul-26|12:00|Match 86 Winner|Match 88 Winner|Round of 16
96|7-Jul-26|16:00|Match 85 Winner|Match 87 Winner|Round of 16
97|9-Jul-26|16:00|Match 89 Winner|Match 90 Winner|Quarter-finals
98|10-Jul-26|15:00|Match 93 Winner|Match 94 Winner|Quarter-finals
99|11-Jul-26|17:00|Match 91 Winner|Match 92 Winner|Quarter-finals
100|11-Jul-26|21:00|Match 95 Winner|Match 96 Winner|Quarter-finals
101|14-Jul-26|15:00|Match 97 Winner|Match 98 Winner|Semi-finals
102|15-Jul-26|15:00|Match 99 Winner|Match 100 Winner|Semi-finals
103|18-Jul-26|17:00|Match 101 Loser|Match 102 Loser|Third Place
104|19-Jul-26|15:00|Match 101 Winner|Match 102 Winner|Final
`.trim();
