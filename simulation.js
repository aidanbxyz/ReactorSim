/*******************************/
/* Nuclear Reaction Simulation */
/*    By Aidan B @aidanbxyz    */
/*******************************/

const canvasId = "simcanvas";
const mobileMsg = "Not supported on mobile devices.";
const circSizeCoeff = 0.35;
const startingWaterTemp = 10.0;
const maxParticleSpeed = 5;

/* End editable variables */

window.particles = [];

function genDecay() {
    let weights = [
        [.0, .4,  .9999],
        [.5, 100, .0001]
    ];
    if (Math.random() < weights[0][2]) {
        return Math.floor((Math.random()*(weights[0][1]-weights[0][0])+weights[0][0])*10)/10;
    } else {
        return Math.floor((Math.random()*(weights[1][1]-weights[1][0])+weights[1][0])*10)/10;
    }
}

window.mouseelem = [1,1];
function runSimulation() { // All Hail The Simulation
    const simcanvas = document.getElementById("simcanvas");
    simcanvas.width = window.innerWidth;
    simcanvas.height = window.innerHeight;
    const context = simcanvas.getContext("2d");

    let vertElem = document.getElementById("verte").value;
    let horiElem = document.getElementById("horie").value;
    let circSize = window.innerWidth/horiElem;
    document.getElementById("verte").max = Math.floor(window.innerHeight/circSize)+1;
    document.getElementById("vertt").innerHTML = document.getElementById("verte").value-1;
    let cntrlRod = document.getElementById("rodspace").value;

    context.fillStyle = "#222222";
    context.fillRect(0,0,simcanvas.width,simcanvas.height);

    let coolState = {}; // access via coolState['y<y>']['x<x>']
    let elemState = {}; // access via elemState['y<y>']['x<x>']
    if (typeof window.blockRods === 'undefined' || window.blockRods.length !== Math.ceil(horiElem/cntrlRod)) {
        window.blockRods = new Array(Math.ceil(horiElem/cntrlRod)).fill(simcanvas.height);
    }
    window.rodLoc = new Array(Math.ceil(horiElem/cntrlRod));

    for (let y = 1; y < vertElem; y++) { // draw elements
        coolState['y'+y] = {};
        elemState['y'+y] = {};
        for (let x = 1; x < horiElem; x++) {
            coolState['y'+y]['x'+x] = startingWaterTemp;
            elemState['y'+y]['x'+x] = genDecay();
            context.beginPath();
            context.moveTo(x*circSize,100);
            context.arc(x*circSize, y*circSize, circSizeCoeff*circSize, 0, Math.PI*2, false);
            context.fillStyle='#ffffff';
            context.fill();
        }
    }

    for (let rod = 1; rod < window.blockRods.length; rod++) {
        context.beginPath();
        context.moveTo(cntrlRod*rod*circSize+0.5*circSize, 0);
        context.lineTo(cntrlRod*rod*circSize+0.5*circSize, window.blockRods[rod]);
        window.rodLoc[rod] = cntrlRod*rod*circSize+0.5*circSize;
        context.lineWidth = 6;
        context.strokeStyle = '#cccccc';
        context.stroke();
        context.font = '24px Noto Sans';
        context.fillText(Math.round(window.blockRods[rod]/simcanvas.height*100)+"%",cntrlRod*rod*circSize+0.5*circSize-64, simcanvas.height-10);
    }

    for (let y = 1; y < Object.keys(elemState).length; y++) { // particle movement
        for (let x = 1; x < Object.keys(elemState['y'+y]).length; x++) {
            if (Math.random()*100 < elemState['y'+y]['x'+x]) {
                window.particles.push([x*circSize, y*circSize, Math.round(Math.random()*maxParticleSpeed*2)-maxParticleSpeed, Math.round(Math.random()*maxParticleSpeed*2)-maxParticleSpeed]); // x, y, x movement, y movement
                if (Math.abs(window.particles[window.particles.length-1][2]) < 0.1 || Math.abs(window.particles[window.particles.length-1][3]) < 0.1) {
                    window.particles.splice(window.particles.length-1,1);
                }
            }
        }
    }

    for (let p = 0; p < window.particles.length; p++) {
        window.particles[p][0] += window.particles[p][2];
        window.particles[p][1] += window.particles[p][3];
        if (window.particles[p][0] > simcanvas.width || window.particles[p][1] > simcanvas.height || window.particles[p][0] < 0 || window.particles[p][1] < 0) {
            window.particles.splice(p, 1);
        }
        context.beginPath();
        context.moveTo(window.particles[p][0], window.particles[p][1]);
        context.arc(window.particles[p][0], window.particles[p][1], 5, 0, Math.PI*2, false);
        context.fillStyle='#000000';
        context.fill();
        //window.particles.splice(p,1); // for testing rates
    }

    var mouseoverinfo = function (ev) {
        document.getElementById('mouseInfo').style.transform = 'translateY('+(ev.clientY)+'px)';
        if (window.innerWidth-ev.clientX > 200) {
            document.getElementById('mouseInfo').style.transform += 'translateX('+(ev.clientX+10)+'px)';
        } else {
            document.getElementById('mouseInfo').style.transform += 'translateX('+(ev.clientX-210)+'px)';
        }
        window.mouseelem = [Math.round(ev.clientX/circSize), Math.round(ev.clientY/circSize)];
        document.getElementById('mouseInfo').innerHTML = '[' + window.mouseelem + '] Decay Chance: ' + Number(elemState['y'+mouseelem[1]]['x'+mouseelem[0]]).toFixed(1) + '%<br>Water Temp: ' + Number(coolState['y'+mouseelem[1]]['x'+mouseelem[0]]).toFixed(1) + 'C';
    }
    document.removeEventListener("mousemove", mouseoverinfo);
    document.addEventListener("mousemove", mouseoverinfo, false);
    document.getElementById('mouseInfo').innerHTML = '[' + window.mouseelem + '] Decay Chance: ' + Number(elemState['y'+mouseelem[1]]['x'+mouseelem[0]]).toFixed(1) + '%<br>Water Temp: ' + Number(coolState['y'+mouseelem[1]]['x'+mouseelem[0]]).toFixed(1) + 'C';
}

// Checks for mobile device and displays message (<3 detectmobilebrowsers.com)
onacomputer = true;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))onacomputer=false})(navigator.userAgent||navigator.vendor||window.opera);
if (onacomputer) {
    document.onclick = function (e) {
        if (document.getElementById("menudiv").style.display === "none" && document.getElementById("aboutdiv").style.display === "none") {
            let map = window.rodLoc.map(function (x){return Math.abs(x-e.clientX);});
            let tmp = [0,99999999];
            for (let i = 0; i < map.length; i++) {
                if (map[i] < tmp[1]) {
                    tmp[1] = map[i];
                    tmp[0] = i;
                }
            }
            if (tmp[1] < 10) {
                window.blockRods[tmp[0]] = e.clientY;
                runSimulation();
            }
        }
    }
    runSimulation();
    window.simint = setInterval(runSimulation, 1000/document.getElementById("framerate").value);
} else { document.body.innerHTML = mobileMsg; }