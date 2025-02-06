let G = 6.6743e-11 // m3⋅kg−1⋅s−2
let cAU = 1495978710
let Mearth = 5.97219e24
let time = 86164.0905 

console.log(G / (cAU**3 / (Mearth*time**2)))

if(process.argv.length>1) {
	switch(process.argv[2]) {
		case "v" : console.log(parseFloat(process.argv[3])/cAU*time)
        case "d" : console.log(parseFloat(process.argv[3])/cAU)
	}
}