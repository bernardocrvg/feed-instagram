import os
import json
import requests

# Configurações
TOKEN = os.environ.get("IG_TOKEN")
ACCOUNT_ID = os.environ.get("IG_ACCOUNT_ID")

# --- AQUI VOCÊ CONFIGURA O QUE QUER BUSCAR ---
TARGET_USERNAME = "igrejadapenharj" # O perfil que você quer "espiar"
TARGET_HASHTAG = "#sitedaigreja"    # A hashtag para filtrar (deixe "" se quiser todos os posts)

if not TOKEN or not ACCOUNT_ID:
    print("ERRO FATAL: IG_TOKEN ou IG_ACCOUNT_ID não encontrados no GitHub Secrets.")
    exit(1)

def fetch_discovery_media():
    print(f"Buscando posts de @{TARGET_USERNAME} usando Business Discovery...")
    
    # A URL especial que usa o SEU ID para buscar as fotos do ALVO
    url = f"https://graph.facebook.com/v18.0/{ACCOUNT_ID}?fields=business_discovery.username({TARGET_USERNAME}){{media{{id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username}}}}&access_token={TOKEN}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if "error" in data:
            print(f"ERRO da API: {data['error']['message']}")
            return []
            
        # O caminho dos dados na resposta do Business Discovery é diferente
        raw_media = data.get("business_discovery", {}).get("media", {}).get("data", [])
        
        if not raw_media:
            print(f"Nenhum post encontrado no perfil @{TARGET_USERNAME}.")
            return []
            
        posts = process_posts(raw_media)
        print(f"Sucesso! {len(posts)} posts filtrados com a hashtag {TARGET_HASHTAG}.")
        return posts
        
    except Exception as e:
        print(f"Erro de conexão com a API: {str(e)}")
        return []

def process_posts(raw_data):
    posts = []
    for item in raw_data:
        caption = item.get("caption", "")
        
        # Filtro da hashtag
        if TARGET_HASHTAG and TARGET_HASHTAG.lower() not in caption.lower():
            continue

        media_url = item.get("media_url")
        # Se for vídeo, tenta pegar a thumbnail
        if item.get("media_type") == "VIDEO":
            media_url = item.get("thumbnail_url", media_url)
            
        if not media_url:
            continue

        posts.append({
            "id": item["id"],
            "caption": caption,
            "media_url": media_url,
            "permalink": item["permalink"],
            "timestamp": item["timestamp"],
            "username": item.get("username", TARGET_USERNAME)
        })
    return posts

def save_posts(posts):
    output_path = os.path.join("frontend", "public", "posts.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"Arquivo salvo com sucesso em: {output_path}")

if __name__ == "__main__":
    posts = fetch_discovery_media()
    if posts:
        save_posts(posts)
    else:
        print("Nenhum post atendeu aos critérios. O arquivo posts.json não foi gerado/atualizado.")