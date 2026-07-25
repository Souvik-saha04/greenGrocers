import os
from dotenv import load_dotenv
import google.generativeai as genai
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))  

model = genai.GenerativeModel("models/gemini-3.1-flash-lite")

def generate_message(decision, price,user_price):
    if decision == "COUNTER":
        prompt=f"""
        1.you are a GenZ and a pro negotiator so you have to counter accordinly 
        2.you have to maximize profits by testing the user with the negotiation but in one precise sentence
        3.the actual price is {price} rupees 
        4.the user offered price is {user_price}
        5.now you have to get a very profitable price for this product by giving the user a bit of room for negotiation 
    """
    elif decision=="ACCEPT":
        prompt=f"""
        1.you are a GenZ and a pro negotiator so you have to answer accordinly just like a friend  
        2.thank the user in a GenZ way for the price but in one precise sentence
        3.just inform the user in the last that final price in a precise chat
        4.the actual price is {price} rupees 
        5.the user offered price is {user_price}
    """
    else:
        prompt=f"""
        1.you are a GenZ and a pro negotiator so you have to counter accordinly 
        2.reject the user offer in a GenZ way and give a small bye bye note also but in one precise sentence
        3.the actual price is {price} rupees 
        4.the user offered price is {user_price}
    """
    response = model.generate_content(prompt)
    return response.text
