import { supabase } from "../config/supabase.js";

export const publishOffer = async (req, res) => {
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
      res
        .status(400)
        .json({ error: "Servidor: Es necesario el id del usuario" });
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

    res
      .status(200)
      .json({ message: "Servidor: Oferta publicada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Servidor: Error interno del servidor" });
  }
};

export const getAllOffers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, job_title, company, location, salary, job_type, work_mode, experience, description, skills"
      );

    if (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "Servidor: No se pudieron obtener las ofertas" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Servidor: Error interno del servidor" });
  }
};

export const getOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", offerId)
      .single();

    if (error) {
      console.log(error);

      return res
        .status(500)
        .json({ error: "Servidor: No se pudieron obtener las ofertas" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Servidor: Error interno del servidor" });
  }
};
