
import requests
from flask import Flask, request, jsonify, render_template, redirect
import json
import time
from datetime import datetime, timedelta, date
from flask_cors import CORS, cross_origin
import yfinance as yf

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

is_inside_bar = lambda prev_high, prev_low, current_high, current_low: True if prev_high >= current_high and prev_low <= current_low else False
is_outside_bar = lambda prev_high, prev_low, current_high, current_low: True if prev_high < current_high and prev_low > current_low else False

@app.route("/")
@cross_origin()
def main():
    data = []
    tickers = 'C PTON JNJ AAPL WMT DIS ORCL UPS MSFT FB UBER AMD NVDA'
    start = date.today() + timedelta(days=1)
    end = date.today() + timedelta(days=1)
    
    # format start/end dates for market open
    weekday = datetime.today().weekday()
    # if its saturday, set start date to friday
    if weekday == 5:
        start = date.today() + timedelta(days=-1)
    # if its Sunday, set start date to friday
    if weekday == 6:
        start = date.today() + timedelta(days=-2)
    # if its Monday, set start date to friday
    if weekday == 0:
        start = date.today() + timedelta(days=-3)

    # fetch candlestick data
    response = yf.Tickers(tickers)
    for ticker in tickers.split(" "):
        quote = response.tickers.get(ticker).history(start=start, end=end)
        
        prev_high = quote.iloc[0, 1]
        prev_low = quote.iloc[0, 2]

        current_high = quote.iloc[1, 1]
        current_low = quote.iloc[1, 2]

        inside_bar = is_inside_bar(
            prev_high=prev_high,
            prev_low=prev_low,
            current_high=current_high,
            current_low=current_low
        )

        outside_bar = is_outside_bar(
            prev_high=prev_high,
            prev_low=prev_low,
            current_high=current_high,
            current_low=current_low
        )

        if inside_bar or outside_bar:
            data.append({
                "ticker": ticker,
                "start": start,
                "end": datetime.today(),
                "inside_bar": inside_bar,
                "outside_bar": outside_bar,
                "previous_high": round(prev_high, 2),
                "previous_low": round(prev_low, 2),
                "current_high": round(current_high, 2),
                "current_low": round(current_low, 2),
            })

    return jsonify({ "data": data })


if __name__ == "__main__":
    app.run(debug=True)

