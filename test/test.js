// let freettsCom = require( "../freetts.com").freetts;
//
// freettsCom("pt-PT", "pt-PT-Standard-A", `Em que caso os veículos perdem prioridade mesmo que se apresentam pelo direito?
// Quando depara com sinal de aproximação de estrada com prioridade, paragem obrigatória, a luz vermelha do sinal luminoso, quando o agente regulador do trânsito manda parar, ou quando pela esquerda apresentam ambulância, bombeiro, carro de polícia ou qualquer veículo que vá transportar doente ou feridos com marcha devidamente assinalada, e também quando deparo com colunas militares ou militarizadas.
// `, "C:\\var\\workspace\\perguntas-resposta\\audios\\99.mp3" ).then( value => {
//     console.log( value )
// })


const  { normalizeDiacritics }  = require("normalize-text");
const  Path  = require("path");
const NodeID3 = require("node-id3");


// let OriginalQuestion = "Qual é a velocidade máxima para os automóveis pesado de passageiro nas autoestradas!!?";
// let importance = OriginalQuestion.split("!");
// let question = importance.filter( value => value.length ).join("");
// // console.log( importance.length, question )
// console.log( normalizeDiacritics( OriginalQuestion ))
//
// //language=file-reference
// let url = "C:\\var\\workspace\\perguntas-resposta\\audios\\Important\\Important-1\\theoretic - Important_1 - 024 - Em que caso um veiculo pode exceder a sua largura movel.mp3"
// NodeID3.write({
//     title: "Em que caso um veículo pode exceder a sua largura móvel?",
//     trackNumber: "24/7",
//     album: "Codigo de estrada",
//     language:"pt-PT",
//     genre: `Segurança Rodoviaria Teoria`,
//     copyrightUrl: "https://github.com/zootakuxy",
//     copyright:"@zootakuxy",
//     publisher:"https://freetts.com",
//     image: "C:\\var\\workspace\\perguntas-resposta\\3440675.png",
//     comment:{
//         language: "pt-PT",
//         text: "Um veículo pode exceder a sua largura móvel, quando houver uma carga que não pode ser demolida. Tem que pedir uma autorização na secção da viação, só poderá exceder 25 cm sendo 12,5 cm para cada lado, só poderá transitar numa faixa de rodagem com uma largura que seja superior à 6 metros e acompanhado por um agente de autoridade."
//     }
// }, url );
//

//language=file-reference
let path = "C:\\var\\workspace\\perguntas-resposta\\audios\\Q&A\\Q&A - mechanics\\Q&A - 041 -  De que se compoe um injetor.mp3"
var wavFileInfo = require('wav-file-info');
wavFileInfo.infoByFilename(path, function(err, info){
    console.log( err )
    // if (err) throw err;
    // console.log(info);
});



