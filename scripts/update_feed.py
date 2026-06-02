import os
import json
import requests
from datetime import datetime

# Configurações
TOKEN = os.environ.get("IG_TOKEN")
ACCOUNT_ID = os.environ.get("IG_ACCOUNT_ID")
TARGET_HASHTAG = "#sitedaigreja" # O filtro mágico da sua hashtag!

if not TOKEN:
    print("AVISO: Token não encontrado.")
    exit(0)

def get_instagram_posts():
    print("--- Iniciando Modo Direto (ID Específico) ---")
    
    if ACCOUNT_ID:
        print(f"Usando ID configurado manualmente: {ACCOUNT_ID}")
        return fetch_media(ACCOUNT_ID)
    
    print("AVISO: IG_ACCOUNT_ID não configurado. Tentando descoberta automática...")
    try:
        me_resp = requests.get(f"https://graph.facebook.com/v18.0/me?fields=instagram_business_account&access_token={TOKEN}").json()
        if "instagram_business_account" in me_resp:
            return fetch_media(me_resp["instagram_business_account"]["id"])
            
        accounts_resp = requests.get(f"https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token={TOKEN}").json()
        if "data" in accounts_resp:
            for page in accounts_resp["data"]:
                if "instagram_business_account" in page:
                    return fetch_media(page["instagram_business_account"]["id"])
    except Exception as e:
        print(f"Erro na descoberta automática: {e}")

    print("ERRO FATAL: Não foi possível obter o ID da conta. Configure o segredo IG_ACCOUNT_ID.")
    return []

def fetch_media(ig_user_id):
    print(f"Buscando posts para o ID: {ig_user_id}...")
    media_url = f"https://graph.facebook.com/v18.0/{ig_user_id}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token={TOKEN}&limit=100"
    
    try:
        response = requests.get(media_url)
        data = response.json()
        
        if "error" in data:
            print(f"ERRO ao buscar mídia: {data['error']['message']}")
            return []
            
        posts = process_posts(data.get("data", []))
        print(f"Sucesso! {len(posts)} posts filtrados encontrados.")
        return posts
    except Exception as e:
        print(f"Erro de conexão: {str(e)}")
        return []

def process_posts(raw_data):
    posts = []
    for item in raw_data:
        caption = item.get("caption", "")
        
        # O Filtro: ignora o post se a hashtag não estiver na legenda
        if TARGET_HASHTAG.lower() not in caption.lower():
            continue

        media_url = item.get("media_url")
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
            "username": item.get("username", "")
        })
    return posts

def save_posts(posts):
    output_path = os.path.join("frontend", "public", "posts.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"Arquivo salvo em: {output_path}")

if __name__ == "__main__":
    posts = get_instagram_posts()
    if posts:
        save_posts(posts)
    else:
        print("Nenhum post foi salvo (ou nenhum post atendeu ao critério da hashtag).")