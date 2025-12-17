-- Founders: minimal metadata column + seed initial founders from 2025 CSV
-- Applied in dev via Supabase MCP on 2025-12-17

begin;

alter table public.member_profile
add column if not exists founder_meta jsonb not null default '{}'::jsonb;

-- Seed 7 founders (idempotent by display_name + source)
with payload as (
  select
    (item->>'display_name') as display_name,
    (item->>'first_name') as first_name,
    (item->>'last_name') as last_name,
    nullif(item->>'biography','') as biography,
    nullif(item->>'profile_image_url','') as profile_image_url,
    nullif(item->>'founder_roles','') as founder_roles,
    coalesce(item->'social_media','{}'::jsonb) as social_media,
    coalesce(item->'founder_meta','{}'::jsonb) as founder_meta,
    gen_random_uuid() as member_id
  from jsonb_array_elements($$[
  {
    "first_name": "Belli",
    "last_name": "Ramírez",
    "display_name": "Belli Ramírez",
    "biography": "Belli Ramírez, es un referente de la dirección de producción en proyectos de animación en España. Belli cuenta con 30 años de experiencia gestionando películas y series de televisión.\nHa tenido la oportunidad de ampliar su experiencia trabajando para un gran número de productoras de animación, de la cuales cabe destacar la ganadora de un Oscar Animal Logic en Sydney, Australia, Ilion Animation Studios, donde ejerció como jefa de la unidad de Producción en la película Planet 51 y como jefa de Producción en la primera y cuarta temporada de Pocoyo, una de las series de tv más reconocidas internacionalmente.\nEn la actualidad Belli es fundadora y consultora en Mr. Cohl, donde colabora en el desarrollo de proyectos de animación. Son varios los clientes para los que suele trabajar, entre ellos: Zinkia, Hampa, MediaPro, Grupo Caribe, Fernando Trueba PC, WarnerBros, Inicia Films y Atlántika films entre otros. Compagina la consultoría, la dirección de producción y la formación. En este último ámbito es profesora asociada en La UPV, Escuela TAI,  y en Universidad Pompeu Fabra de Barcelona.\nBelli es socia fundadora de Mia, Mujeres en la industria de la animación y miembro de la Academia de las Artes y las Ciencias Cinematográficas de España",
    "profile_image_url": "https://drive.google.com/u/0/open?usp=forms_web&id=1n7tcPYvyqMipQXI86PEjYvuWE0rYrqKu",
    "founder_roles": "Presidenta provisional",
    "social_media": {
      "instagram": "https://instagram.com/belliramirez",
      "linkedin": "https://www.linkedin.com/in/belliramirez/"
    },
    "founder_meta": {
      "roles": "Presidenta provisional",
      "raw_social": [
        "@belliramirez",
        "https://www.linkedin.com/in/belliramirez/"
      ],
      "photo_source": "https://drive.google.com/u/0/open?usp=forms_web&id=1n7tcPYvyqMipQXI86PEjYvuWE0rYrqKu",
      "source": "INFO WEB SOCIAS FUNDADORAS -2.csv"
    }
  },
  {
    "first_name": "MYRIAM",
    "last_name": "BALLESTEROS",
    "display_name": "MYRIAM BALLESTEROS",
    "biography": "Myriam Ballesteros\nDirectora y showrunner de animación\n\nMyriam Ballesteros es creadora, directora y productora de destacadas series y cortos de animación para el público infantil y juvenil. Fundadora de MB Producciones e IMIRA Entertainment, ha sido showrunner, story editor y directora creativa de éxitos internacionales como Lucky Fred, Sandra, detective de cuentos, Lola & Virginia o Meme y el Sr. Bobo, vendidas en más de 100 países y premiadas en festivales como CIFF, Annecy o Cartoon on the Bay.\n\nLicenciada en Periodismo y especializada en cine y animación en NYU, BBC y EAVE, ha dirigido también cortos como La superrabieta o Cenicienta Swing, y desarrolla actualmente las series Annie & Carola y Cenicienta Enmascarada.\n\nEstá también preparando su primer largometraje, Amalur Profezia, una aventura épica protagonizada por una adolescente con poderes mágicos y una gamer brillante que viajan a un mundo mitológico para derrotar al Señor de las Tinieblas.\n\nHa sido fundadora y presidenta de MIA, impulsando la visibilidad y el liderazgo de las mujeres en la animación.",
    "profile_image_url": "https://drive.google.com/u/0/open?usp=forms_web&id=1bdvFmjGUksyN0c5VXqWCaOTn7Im4ZHqj",
    "founder_roles": "fundadora, vocal y presidenta",
    "social_media": {
      "website": "https://mbproducciones.com/",
      "linkedin": "https://www.linkedin.com/in/myriamballesteros/",
      "instagram": "https://www.instagram.com/mb_produ/"
    },
    "founder_meta": {
      "roles": "fundadora, vocal y presidenta",
      "raw_social": [
        "https://mbproducciones.com/",
        "https://www.linkedin.com/in/myriamballesteros/",
        "https://www.instagram.com/mb_produ/"
      ],
      "photo_source": "https://drive.google.com/u/0/open?usp=forms_web&id=1bdvFmjGUksyN0c5VXqWCaOTn7Im4ZHqj",
      "source": "INFO WEB SOCIAS FUNDADORAS -2.csv"
    }
  },
  {
    "first_name": "Alicia",
    "last_name": "Núñez Puerto",
    "display_name": "Alicia Núñez Puerto",
    "biography": "Directora y productora nominada a los Goya con 20 años de experiencia, miembro numerario de la Academia de Cine de España y Andalucía, Alicia ha trabajado en más de 30 grandes producciones para compañías como Aardman Animations, BRB Internacional o Ánima Estudios.\n\nHa dirigido dos cortometrajes \"LA PRIMAVERA SIEMPRE VUELVE\" y \"ONE WAY CYCLE\"  con los que ha obtenido selecciones y premios en festivales de todo el mundo. Es miembro de MIA, AAMMA, DAMA, Egeda y La coordinadora del cortometraje.\n\nActualmente, Alicia es VP de Desarrollo Creativo de Ánima Estudios, es co-productora ejecutiva de \"BATMAN AZTECA\", de WB y prepara su primer largometraje como directora.",
    "profile_image_url": "https://drive.google.com/u/0/open?usp=forms_web&id=1ee5zvmLIqLUNlEOi4jGnuDgC-s9oM2P_",
    "founder_roles": "Secretaria. Noviembre 2018 a septiembre 2019. // Presidenta. De septiembre 2019 a enero 2021. // Vocal. Desde julio 2025.",
    "social_media": {
      "instagram": "https://www.instagram.com/aliolinu/",
      "linkedin": "https://www.linkedin.com/in/alicianunezpuerto/"
    },
    "founder_meta": {
      "roles": "Secretaria. Noviembre 2018 a septiembre 2019. // Presidenta. De septiembre 2019 a enero 2021. // Vocal. Desde julio 2025.",
      "raw_social": [
        "https://www.instagram.com/aliolinu/",
        "https://www.linkedin.com/in/alicianunezpuerto/"
      ],
      "photo_source": "https://drive.google.com/u/0/open?usp=forms_web&id=1ee5zvmLIqLUNlEOi4jGnuDgC-s9oM2P_",
      "source": "INFO WEB SOCIAS FUNDADORAS -2.csv"
    }
  },
  {
    "first_name": "Dune",
    "last_name": "Blanco",
    "display_name": "Dune Blanco",
    "biography": "Dune lleva dedicándose al Desarrollo Visual y Creativo para Animación y Videojuegos por más de 10 años. Ha trabajado para productoras como CARTOON NETWORK, CANAL+, ÁNIMA ESTUDIOS, BRB Internacional, TOMAVISTAS, TOONZ, LIGHTBOX, SOCIAL POINT, IGG…\nTrabajó para ÁNIMA ESPAÑA realizando el desarrollo inicial y posteriormente el Diseño de Producción de la serie PINY Institute of New York, emitida en Disney Channel.\nFundadora de MIA (Asociación de Mujeres en la Industria de la Animación), junto a otras compañeras de profesión (2018).",
    "profile_image_url": "https://drive.google.com/u/0/open?usp=forms_web&id=1l17-wb_6q8uWqi0M65emFlmw9fNPs9x-",
    "founder_roles": "Vocal",
    "social_media": {
      "linkedin": "https://www.linkedin.com/in/duneblanco/",
      "instagram": "https://www.instagram.com/mrklaus_studio/",
      "website": "http://www.mrklausstudio.com/demo-reel/"
    },
    "founder_meta": {
      "roles": "Vocal",
      "raw_social": [
        "https://www.linkedin.com/in/duneblanco/",
        "https://www.instagram.com/duneblanco/",
        "http://www.mrklausstudio.com/demo-reel/",
        "https://www.instagram.com/mrklaus_studio/"
      ],
      "photo_source": "https://drive.google.com/u/0/open?usp=forms_web&id=1l17-wb_6q8uWqi0M65emFlmw9fNPs9x-",
      "source": "INFO WEB SOCIAS FUNDADORAS -2.csv"
    }
  },
  {
    "first_name": "ELENA",
    "last_name": "GOBERNADO SANTOS",
    "display_name": "ELENA GOBERNADO SANTOS",
    "biography": "Elena Gobernado cuenta con más de 25 años de experiencia en el ámbito audiovisual, está especializada en el desarrollo literario de proyectos audiovisuales como guionista, coordinadora, script editor y asesora.",
    "profile_image_url": "https://drive.google.com/u/0/open?usp=forms_web&id=1vpc1E1aXtFudFDmVKmWZMC4TtLTaxWVT",
    "founder_roles": "NINGUNO",
    "social_media": {},
    "founder_meta": {
      "roles": "NINGUNO",
      "raw_social": [
        "@gobernado7 (Instagram y X) Elena Gobernado (Linkedin)"
      ],
      "photo_source": "https://drive.google.com/u/0/open?usp=forms_web&id=1vpc1E1aXtFudFDmVKmWZMC4TtLTaxWVT",
      "source": "INFO WEB SOCIAS FUNDADORAS -2.csv"
    }
  },
  {
    "first_name": "Tania",
    "last_name": "Palma",
    "display_name": "Tania Palma",
    "biography": "Tania Palma es directora de producción y productora ejecutiva de animación.",
    "profile_image_url": "https://drive.google.com/u/0/open?usp=forms_web&id=1mk-4N1fSYjj5FU878pJkdTWuUu8ksBGO",
    "founder_roles": "Secretaría (2021 - 2023)",
    "social_media": {},
    "founder_meta": {
      "roles": "Secretaría (2021 - 2023)",
      "raw_social": [
        "Web: www.trendpicstudio.com",
        "IMDb: https://www.imdb.com/es-es/name/nm16655959/",
        "Linkedin: www.linkedin.com/in/tania-palma-7242b740/",
        "Instagram: @trendpicstudio @taniapalmarodriguez",
        "X: @TrendPicStudio",
        "Facebook: tania.palmarodriguez.7"
      ],
      "photo_source": "https://drive.google.com/u/0/open?usp=forms_web&id=1mk-4N1fSYjj5FU878pJkdTWuUu8ksBGO",
      "source": "INFO WEB SOCIAS FUNDADORAS -2.csv"
    }
  },
  {
    "first_name": "Deneb",
    "last_name": "Sabater Ventura",
    "display_name": "Deneb Sabater Ventura",
    "biography": "Deneb Sabater Ventura, inicia su andadura profesional en el sector de la animación en un entrañable estudio de animación en Valencia.",
    "profile_image_url": "https://drive.google.com/u/0/open?usp=forms_web&id=14ozF3I_tNlUVurer9ANoY80qsnXgE0ru",
    "founder_roles": "Vicepresidente y Tesorera 2018-2021",
    "social_media": {
      "linkedin": "https://www.linkedin.com/in/denebsabater/",
      "imdb": "https://www.imdb.com/name/nm5453732/",
      "instagram": "https://www.instagram.com/denebestrela/"
    },
    "founder_meta": {
      "roles": "Vicepresidente y Tesorera 2018-2021",
      "raw_social": [
        "https://www.linkedin.com/in/denebsabater/",
        "https://www.imdb.com/name/nm5453732/",
        "https://www.instagram.com/denebestrela/"
      ],
      "photo_source": "https://drive.google.com/u/0/open?usp=forms_web&id=14ozF3I_tNlUVurer9ANoY80qsnXgE0ru",
      "source": "INFO WEB SOCIAS FUNDADORAS -2.csv"
    }
  }
]$$::jsonb) item
),
filtered as (
  select *
  from payload p
  where not exists (
    select 1
    from public.member_profile mp
    where lower(coalesce(mp.display_name, '')) = lower(coalesce(p.display_name, ''))
      and mp.founder_meta->>'source' = 'INFO WEB SOCIAS FUNDADORAS -2.csv'
  )
),
ins_members as (
  insert into public.members (id, is_active)
  select member_id, false
  from filtered
  returning id
),
ins_profiles as (
  insert into public.member_profile (
    member_id,
    first_name,
    last_name,
    display_name,
    biography,
    profile_image_url,
    social_media,
    privacy_level,
    profile_completion,
    founder_meta
  )
  select
    f.member_id,
    f.first_name,
    f.last_name,
    f.display_name,
    case
      when f.founder_roles is not null and f.founder_roles <> '' then f.biography || E'\n\n' || 'Roles en junta: ' || f.founder_roles
      else f.biography
    end,
    f.profile_image_url,
    f.social_media,
    'public'::public.privacy_level,
    100,
    f.founder_meta
  from filtered f
  returning member_id
),
ins_membership as (
  insert into public.member_membership (
    member_id,
    membership_type,
    is_founder,
    is_lifetime,
    membership_status
  )
  select
    f.member_id,
    'pleno_derecho'::public.membership_type,
    true,
    true,
    'active'::public.membership_status
  from filtered f
  on conflict (member_id) do update
  set is_founder = true,
      is_lifetime = true,
      membership_type = excluded.membership_type,
      membership_status = 'active'::public.membership_status
  returning member_id
)
update public.members m
set is_active = true
where m.id in (select member_id from ins_membership);

commit;


