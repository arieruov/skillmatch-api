import { supabase } from "../config/supabase.js";
import {
	tokenize,
	termFrequency,
	inverseDocumentFrequency,
	tfidfVector,
	cosineSimilarity,
} from "../utils/tf-idf.js";

// Almacena una oferta de trabajo en la base de datos
const publishOffer = async (req, res) => {
	try {
		const {
			jobTitle,
			company,
			location,
			applicationUrl,
			jobType,
			experience,
			workMode,
			salary,
			skills,
			description,
			aboutCompany,
			responsabilities,
			requirements,
			weOffer,
		} = req.body;

		const userId = req.user.id;

		if (
			!jobTitle ||
			!company ||
			!location ||
			!applicationUrl ||
			!jobType ||
			!experience ||
			!workMode ||
			!salary ||
			!skills ||
			!description ||
			!aboutCompany ||
			!responsabilities ||
			!requirements ||
			!weOffer
		) {
			return res
				.status(400)
				.json({ error: "Servidor: Todos los campos son requeridos" });
		}

		if (!userId) {
			res.status(400).json({
				error: "Servidor: Es necesario el id del usuario",
			});
		}

		const { error } = await supabase.from("jobs").insert([
			{
				job_title: jobTitle,
				company: company,
				location: location,
				application_url: applicationUrl,
				job_type: jobType,
				experience: experience,
				work_mode: workMode,
				salary: salary,
				skills: skills,
				description: description,
				about_company: aboutCompany,
				responsabilities: responsabilities,
				requirements: requirements,
				we_offer: weOffer,
				user_id: userId,
			},
		]);

		if (error) {
			console.log(error);

			return res
				.status(500)
				.json({ error: "Servidor: No se pudo publicar la oferta" });
		}

		res.status(200).json({
			message: "Servidor: Oferta publicada correctamente",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

// Devuleve todas las ofertas almacenadas en la base de datos
const getAllOffers = async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("jobs")
			.select(
				"id, job_title, company, location, salary, job_type, work_mode, experience, description, skills"
			);

		if (error) {
			console.log(error);
			return res.status(500).json({
				error: "Servidor: No se pudieron obtener las ofertas",
			});
		}

		res.status(200).json(data);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

// Devuelve una oferta especifica segun el id de la oferta
const getOffer = async (req, res) => {
	try {
		const userId = req.user.id;
		const offerId = req.body.offerId;

		// Trae la oferta de la tabla jobs
		const { data: jobData, error: jobError } = await supabase
			.from("jobs")
			.select("*")
			.eq("id", offerId)
			.single();

		if (jobError || !jobData) {
			console.log(jobError);
			return res
				.status(404)
				.json({ error: "Servidor: No se pudo encontrar la oferta" });
		}

		// Verifica si la oferta está guardada en saved_jobs
		const { data: savedData, error: savedError } = await supabase
			.from("saved_jobs")
			.select("id")
			.eq("user_id", userId)
			.eq("job_id", offerId)
			.single();

		// Adjunta isSaved según si existe coincidencia
		const isSaved = !!savedData;

		res.status(200).json({ ...jobData, isSaved });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

// Guarda una oferta en la tabla de saved_offers
const saveOffer = async (req, res) => {
	try {
		const userId = req.user.id;
		const offerId = req.body.offerId;

		// Verifica si ya existe un registro con el mismo user_id y job_id
		const { data: existing, error: selectError } = await supabase
			.from("saved_jobs")
			.select("id")
			.eq("user_id", userId)
			.eq("job_id", offerId)
			.single();

		if (selectError && selectError.code !== "PGRST116") {
			// PGRST116: No rows found
			console.log(selectError);
			return res.status(500).json({
				error: "Servidor: Error al verificar la oferta guardada",
			});
		}

		if (existing) {
			// Si existe, elimina el registro
			const { error: deleteError } = await supabase
				.from("saved_jobs")
				.delete()
				.eq("user_id", userId)
				.eq("job_id", offerId);

			if (deleteError) {
				console.log(deleteError);
				return res.status(500).json({
					error: "Servidor: No se pudo eliminar la oferta guardada",
				});
			}

			return res.status(200).json({
				message: "Oferta eliminada de guardados",
				isSaved: false,
			});
		}

		// Si no existe, inserta el registro
		const { error } = await supabase
			.from("saved_jobs")
			.insert([{ user_id: userId, job_id: offerId }]);

		if (error) {
			console.log(error);

			return res
				.status(500)
				.json({ error: "Servidor: No se pudo guardar la oferta" });
		}

		res.status(200).json({ message: "Oferta guardada", isSaved: true });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

const getAllSavedOffers = async (req, res) => {
	try {
		const userId = req.user.id;

		const { data, error } = await supabase
			.from("saved_jobs")
			.select(
				"job:job_id(id, job_title, company, location, salary, job_type, work_mode, experience, description, skills)"
			)
			.eq("user_id", userId);

		// Extrae solo los datos de la oferta de trabajo de cada registro
		const jobs = data ? data.map((item) => item.job) : [];

		if (error) {
			console.log(error);
			return res.status(500).json({
				error: "Servidor: No se pudieron obtener las ofertas",
			});
		}

		res.status(200).json(jobs);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

const editOffer = async (req, res) => {
	try {
		const {
			offerId,
			jobTitle,
			company,
			location,
			applicationUrl,
			jobType,
			experience,
			workMode,
			salary,
			skills,
			description,
			aboutCompany,
			responsabilities,
			requirements,
			weOffer,
		} = req.body;

		const userId = req.user.id;

		if (
			!offerId ||
			!jobTitle ||
			!company ||
			!location ||
			!applicationUrl ||
			!jobType ||
			!experience ||
			!workMode ||
			!salary ||
			!skills ||
			!description ||
			!aboutCompany ||
			!responsabilities ||
			!requirements ||
			!weOffer
		) {
			return res
				.status(400)
				.json({ error: "Servidor: Todos los campos son requeridos" });
		}

		if (!userId) {
			return res
				.status(400)
				.json({ error: "Servidor: Es necesario el id del usuario" });
		}

		const { error } = await supabase
			.from("jobs")
			.update({
				job_title: jobTitle,
				company: company,
				location: location,
				application_url: applicationUrl,
				job_type: jobType,
				experience: experience,
				work_mode: workMode,
				salary: salary,
				skills: skills,
				description: description,
				about_company: aboutCompany,
				responsabilities: responsabilities,
				requirements: requirements,
				we_offer: weOffer,
			})
			.eq("id", offerId)
			.eq("user_id", userId);

		if (error) {
			console.log(error);
			return res
				.status(500)
				.json({ error: "Servidor: No se pudo editar la oferta" });
		}

		res.status(200).json({
			message: "Servidor: Oferta editada correctamente",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

const deleteOffer = async (req, res) => {
	try {
		const { offerId } = req.body;
		const userId = req.user.id;

		if (!offerId) {
			return res.status(400).json({
				error: "Servidor: Es necesario el id de la oferta",
			});
		}

		if (!userId) {
			return res
				.status(400)
				.json({ error: "Servidor: Es necesario el id del usuario" });
		}

		const { error } = await supabase
			.from("jobs")
			.delete()
			.eq("id", offerId)
			.eq("user_id", userId);

		if (error) {
			console.log(error);
			return res
				.status(500)
				.json({ error: "Servidor: No se pudo eliminar la oferta" });
		}

		res.status(200).json({
			message: "Servidor: Oferta eliminada correctamente",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

const getOffersPublishedByUser = async (req, res) => {
	try {
		const userId = req.user.id;

		if (!userId) {
			return res.status(400).json({
				error: "Servidor: Es necesario el id del usuario",
			});
		}

		const { data, error } = await supabase
			.from("jobs")
			.select(
				"id, job_title, company, location, salary, job_type, work_mode, experience, description, skills"
			)
			.eq("user_id", userId);

		if (error) {
			console.log(error);

			return res.status(500).json({
				error: "Servidor: No se pudieron obtener las ofertas",
			});
		}

		res.status(200).json(data);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Servidor: Error interno del servidor" });
	}
};

//Son necesarios mas datos en la base de datos para la comparacion
const matchJobs = async (req, res) => {
	try {
		const { skills, filterSimZero = true, experience, workMode } = req.body;
		if (!skills || typeof skills !== "string") {
			return res
				.status(400)
				.json({ error: "Se requiere un string de habilidades" });
		}

		// 1. Obtener todas las ofertas con filtros opcionales
		let query = supabase
			.from("jobs")
			.select(
				"id, job_title, company, location, salary, job_type, work_mode, experience, description, skills, responsabilities, requirements"
			);

		// Aplicar filtros opcionales
		if (experience && experience.trim() !== "") {
			query = query.eq("experience", experience);
		}

		if (workMode && workMode.trim() !== "") {
			query = query.eq("work_mode", workMode);
		}

		const { data: jobs, error } = await query;

		if (error) {
			console.error(error);
			return res
				.status(500)
				.json({ error: "Error al obtener las ofertas" });
		}

		// 2. Preprocesar documentos de ofertas
		const jobDocs = jobs.map((job) => {
			return tokenize(
				[
					job.skills,
					job.description,
					job.responsabilities,
					job.requirements,
				].join(" ")
			);
		});

		// 3. Preprocesar habilidades del usuario
		const userTokens = tokenize(skills.split(",").join(" "));

		// 4. Calcular IDF global
		const allDocs = [...jobDocs, userTokens];
		const idf = inverseDocumentFrequency(allDocs);

		// 5. Vocabulario global
		const vocab = Object.keys(idf);

		// 6. Calcular TF-IDF de usuario
		const userTF = termFrequency(userTokens);
		const userVec = tfidfVector(userTF, idf, vocab);

		// 7. Calcular similitud para cada oferta y devolver solo los campos requeridos
		const rankedJobs = jobs.map((job, idx) => {
			const tf = termFrequency(jobDocs[idx]);
			const jobVec = tfidfVector(tf, idf, vocab);
			const similarity = cosineSimilarity(userVec, jobVec);
			// Solo los campos requeridos + similitud
			return {
				id: job.id,
				job_title: job.job_title,
				company: job.company,
				location: job.location,
				salary: job.salary,
				job_type: job.job_type,
				work_mode: job.work_mode,
				experience: job.experience,
				description: job.description,
				skills: job.skills,
				similarity,
			};
		});

		// Filtrar según el parámetro filterSimZero
		// Si filterSimZero es true, solo devuelve trabajos con similitud > 0
		// Si es false, devuelve todos los trabajos
		let resultJobs = filterSimZero
			? rankedJobs.filter((job) => job.similarity > 0)
			: rankedJobs;

		// Ordenar por similitud descendente
		resultJobs.sort((a, b) => b.similarity - a.similarity);

		res.status(200).json({ jobs: resultJobs });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export {
	publishOffer,
	getAllOffers,
	getOffer,
	saveOffer,
	getAllSavedOffers,
	editOffer,
	deleteOffer,
	getOffersPublishedByUser,
	matchJobs,
};
