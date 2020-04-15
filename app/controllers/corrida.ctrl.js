var path = require('path');
var rootPath = path.join(__dirname, '../../');
var fs = require('fs');
var CorridaBs = require('../business/corrida.bs');
const util = require('util')

const readDirPromise = util.promisify(fs.readdir);
const renamePromise = util.promisify(fs.rename)


module.exports.list = async (req, res) =>{
	var corrida = new CorridaBs();

	await callListPage();
	async function callListPage() {
		await corrida.listHome();
		const data = await corrida.list();
			res.render('list', {
				corrida: data
			})
	}

}	

module.exports.detailPage = async (req, res) => { 
	var corrida = new CorridaBs(req);

		await callDetailPage();
		async function callDetailPage() {
			await corrida.groupCorridaDetail(req);
			const data = await corrida.listTags(req);
			res.render('corrida-detail', {
				corrida: data
			})
		}

}


module.exports.checkCorrida = (req, res) => {
	var fileName = rootPath + '/config/database.json';
	var corrida = new CorridaBs();

	corrida.list((err, result, integerJSON) => {
		if (err) throw console.log("err", err);

		var targetCorrida = req.body.id;
		var corrida = result[targetCorrida]
		var corridaStatus = corrida.status;
		
		integerJSON.corridas[targetCorrida - 4].status = "Despachada"

		fs.writeFile(fileName, JSON.stringify(integerJSON), function writeJSON(err) {
			if (err) return console.log(err);
			console.log(JSON.stringify(integerJSON));
			console.log('writing to ' + fileName);
		});

		if (corridaStatus == "Despachada") {
			res.render('corrida-desp');
		} else {
			res.render('corrida-check', {
			corrida: corrida.nuMCorrida
		})
}

	});

}

module.exports.deleteCorrida = async (req, res) => {
var corrida = new CorridaBs();

var dir = rootPath + 'corridas/config/';
var dirDelete = rootPath + 'corridas/deleted/';


async function getDirectories(path ) {
	const files = await readDirPromise(path);
	const file = parseInt(req.body.id) - 1
	let nameFile = files[file];

	return new Promise((resolve)=>{
		resolve(path+nameFile);
	})
}

 	const result = await corrida.list()

	let targetCorrida = parseInt(req.body.id) -1;
	let corridaTarget = result[targetCorrida]

	const fileName = await getDirectories(dir)

	let moveFile = async (file, dir2) => {
		let f = path.basename(file);
		let dest = path.resolve(dir2, f);
		await renamePromise(file, dest);
	};

	await moveFile(fileName, dirDelete);

	res.render('corrida-delete', {
			corrida: corridaTarget.nuMCorrida
			})
};

