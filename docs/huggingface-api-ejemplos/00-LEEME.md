# HuggingFace Hub API — Ejemplos reales

Estos archivos son respuestas REALES de la API de HuggingFace (https://huggingface.co/api).
Se obtuvieron el 2026-07-02 con un token gratuito de HuggingFace.

## Endpoints usados

### Info de un modelo específico
```
GET https://huggingface.co/api/models/{org}/{model}
Authorization: Bearer hf_tu_token
```

### Buscar modelos
```
GET https://huggingface.co/api/models?sort=downloads&direction=-1&limit=10
GET https://huggingface.co/api/models?filter=code&sort=downloads&direction=-1&limit=10
```

## Archivos incluidos

| Archivo | Modelo | Por qué es útil |
|---|---|---|
| 01-qwen-coder-32b.json | Qwen 2.5 Coder 32B | Modelo open source de código, tiene todos los campos |
| 02-llama-33-70b.json | Llama 3.3 70B | Modelo gated (requiere aceptar términos) |
| 03-deepseek-v3.json | DeepSeek V3 | Modelo chino open source |
| 04-gpt2.json | GPT-2 | Modelo clásico, simple |
| 05-mistral-large.json | Mistral Large | Modelo europeo |
| 06-top-10-modelos-populares.json | Top 10 por downloads | Los más descargados de HF |
| 07-top-10-modelos-codigo.json | Top 10 de código | Los mejores modelos de programación |

## Campos más importantes (25 en total)

1.  id                    → ID del modelo (ej: "Qwen/Qwen2.5-Coder-32B-Instruct")
2.  author               → Quién lo subió
3.  pipeline_tag         → Tipo de tarea (text-generation, fill-mask, etc.)
4.  library_name         → Librería (transformers, diffusers, etc.)
5.  tags                 → Tags del modelo (safetensors, code, qwen, etc.)
6.  downloads            → Total de descargas
7.  likes                → Likes de la comunidad
8.  gated                → Si requiere aceptar términos (false, "manual", "auto")
9.  disabled             → Si está deshabilitado
10. private               → Si es privado
11. lastModified          → Última modificación
12. createdAt             → Fecha de creación
13. cardData              → Datos del README (licencia, idioma, base_model, tags)
14. config                → Configuración técnica (arquitectura, tokenizer)
15. safetensors           → Parámetros exactos del modelo (ej: BF16: 32763876352)
16. inference             → Si HF puede correrlo ("warm", "cold", null)
17. spaces                → Spaces que usan este modelo
18. siblings              → Archivos del repo (.safetensors, config.json, etc.)
19. usedStorage           → Storage usado en bytes
20. sha                   → Hash del commit
21. modelId               → ID del modelo (duplicado de id)
22. model-index           → Resultados de evaluación (si existen)
23. transformersInfo      → Info de transformers (auto_model, processor)
24. widgetData            → Ejemplos del widget
25. _id                   → ID interno de MongoDB

## Cómo obtener tu propio token (gratis)

1. Ve a https://huggingface.co/join
2. Regístrate
3. Ve a https://huggingface.co/settings/tokens
4. Click "New token" → tipo "Read"
5. Copia el token (empieza con hf_)

## Documentación oficial de la API

https://huggingface.co/docs/huggingface_hub/package_reference/hf_api
