import os
from dotenv import load_dotenv
import google.generativeai as genai
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))  

model = genai.GenerativeModel("models/gemini-3.1-flash-lite")

def generate_message(decision, price,user_price):
    if decision == "COUNTER":
        prompt = f"""
        You are a friendly shopkeeper.

        The customer's offer is ₹{user_price}.

        The system has already decided the counter offer as ₹{price}.

        Reply in ONE short, natural sentence.

        Mention the counter price exactly as ₹{price}.

        Do not change the amount.
        Do not calculate another price.
        Simply persuade the customer to accept ₹{price}.
        """
    elif decision=="ACCEPT":
        prompt=f"""
        1.you are a pro negotiator so you have to answer accordinly just like a friend  
        2.thank the user  for the price but in one precise sentence
        3.just inform the user in the last that final price in a precise chat
        4.the actual price is {price} rupees 
        5.the user offered price is {user_price}
    """
    else:
        prompt=f"""
        1.you are a pro negotiator so you have to counter accordinly 
        2.reject the user offer and give a small bye bye note also but in one precise sentence
        3.the actual price is {price} rupees 
        4.the user offered price is {user_price}
    """
    response = model.generate_content(prompt)
    return response.text
