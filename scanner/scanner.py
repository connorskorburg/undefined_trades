
import requests
from flask import Flask, request, jsonify, render_template, redirect
import json
import time
from datetime import datetime, timedelta, date
from flask_cors import CORS, cross_origin
import yfinance as yf
import pandas as pd

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

is_inside_bar = lambda prev_high, prev_low, current_high, current_low: True if prev_high >= current_high and prev_low <= current_low else False
is_outside_bar = lambda prev_high, prev_low, current_high, current_low: True if prev_high < current_high and prev_low > current_low else False

def get_strat_number(prev_high, prev_low, current_high, current_low):
    if  not prev_high or not prev_low or not current_high or not current_low:
        return 'Unknown'
    inside_bar = is_inside_bar(prev_high, prev_low, current_high, current_low)
    outside_bar = is_outside_bar(prev_high, prev_low, current_high, current_low)
    if inside_bar:
        return 1
    if outside_bar:
        return 3
    else:
        return 2

def get_strat_label(strat_number, prev_high, prev_low, current_high, current_low):
    if strat_number == 1 or strat_number == 3:
        return str(strat_number)
    else:
        if prev_high < current_high:
            return '{}U'.format(strat_number)
        if prev_low > current_low:
            return '{}D'.format(strat_number)

def format_ticker_data(prev_high, prev_low, current_high, current_low, current_open, current_close):
    inside_bar = False
    outside_bar = False
    strat_label = 'Unknown'
    strat_number = 'Unknown'
    if prev_high and prev_low and current_high and current_low and current_open and current_close:
        strat_number = get_strat_number(prev_high, prev_low, current_high, current_low)
        outside_bar = is_outside_bar(prev_high, prev_low, current_high, current_low)
        inside_bar = is_inside_bar(prev_high, prev_low, current_high, current_low)
        strat_label = get_strat_label(strat_number, prev_high, prev_low, current_high, current_low)
    data = {
        "outside_bar": outside_bar,
        "inside_bar": inside_bar,
        "close": current_close,
        "open": current_open,
        "current_high": current_high,
        "current_low": current_low,
        "previous_high": prev_high,
        "previous_low": prev_low,
        "strat_number": strat_number,
        "strat_label": strat_label,
        "is_red": True if current_close < current_open else False,
        "is_green": True if current_close > current_open else False
    }
    return data

def get_start_end_dates():
    start = date.today() - timedelta(days=1)
    end = date.today() + timedelta(days=1)
    weekday = datetime.today().weekday()
    # if its saturday, set start date to friday
    if weekday == 5:
        start = date.today() + timedelta(days=-1)
        end = start
    # if its Sunday, set start date to friday
    if weekday == 6:
        start = date.today() + timedelta(days=-2)
        end = start
    # if its Monday, set start date to friday
    if weekday == 0:
        start = date.today() + timedelta(days=-3)
    return start, end

@app.route("/daily_scanner", methods=['GET'])
@cross_origin()
def daily_scanner():
    data = []
    tickers = request.args.get('tickers')
    if not tickers:
        tickers = 'FB AAPL TSLA F GE ORCL RBLX DIS ROKU NFLX SNAP AMD NVDA Z ZM JNJ PFE MRNA V WMT SPY QQQ PYPL SQ HD LOW SOFI MP TWTR PTON GRWG GM SPOT AMZN DE XLE XLF CVS XOM BAC JPM TDOC DOCU TWLO UPWK BARK ABNB U'

    weekday = datetime.today().weekday()
    prev_monday = (date.today() -  timedelta(days=weekday)).strftime('%Y-%m-%d')
    start, end = get_start_end_dates()
    
    # fetch candlestick data
    response = yf.Tickers(tickers)
    # print(response)
    for ticker in tickers.split(" "):
        
        if ticker:
            try:
                quote = response.tickers.get(ticker).history(start=start, end=end)
                history = response.tickers.get(ticker).history(period='ytd', interval='1wk')
            except AttributeError as error:
                print('COULD NOT FIND DATA FOR :', ticker)
                continue

            if not quote.empty:
                prev_day_high = quote.iloc[0, 1]
                prev_day_low = quote.iloc[0, 2]

                current_day_high = quote.iloc[1, 1]
                current_day_low = quote.iloc[1, 2]

                daily_close = quote.iloc[1, 3]
                daily_open = quote.iloc[1, 0]

                daily_data = format_ticker_data(
                    prev_high=prev_day_high,
                    prev_low=prev_day_low,
                    current_high=current_day_high,
                    current_low=current_day_low,
                    current_open=daily_open,
                    current_close=daily_close
                )

            if not history.empty:
                # get last two weeks of data
                dates = list(history.index.values)
                ticker_dates = []
                for d in dates:
                    ticker_date = pd.to_datetime(str(d)) 
                    ticker_date= ticker_date.strftime('%Y-%m-%d')
                    ticker_dates.append(ticker_date)
                
                week_start_index = ticker_dates.index(prev_monday)
                week_start = ticker_dates[week_start_index]
                prev_week_start = ticker_dates[week_start_index - 1]
                
                prev_week_high = history.iloc[week_start_index - 1, 1]
                prev_week_low = history.iloc[week_start_index - 1, 2]
                
                weekly_close = daily_close
                weekly_open = history.iloc[week_start_index, 0]

                current_week_high = 0
                current_week_low = 9999999
                for i in range(week_start_index, len(history)):
                    record = history.iloc[i]
                    record_high = history.iloc[i, 1]
                    record_low = history.iloc[i, 2]
                    if record_high > current_week_high:
                        current_week_high = record_high
                    if record_low < current_week_low:
                        current_week_low = record_low

                weekly_data = format_ticker_data(
                    prev_high=prev_week_high,
                    prev_low=prev_week_low,
                    current_high=current_week_high,
                    current_low=current_week_low,
                    current_open=weekly_open,
                    current_close=weekly_close
                )

                ticker_json = {
                    "ticker": ticker,
                    "start": start.strftime('%Y-%m-%d'),
                    "end": datetime.today().strftime('%Y-%m-%d'),
                    "inside_day": daily_data.get('inside_bar'),
                    "outside_day": daily_data.get('outside_bar'),
                    "daily_close": round(daily_close, 2),
                    "daily_open": round(daily_open, 2),
                    "previous_day_high": round(prev_day_high, 2),
                    "previous_day_low": round(prev_day_low, 2),
                    "current_day_high": round(current_day_high, 2),
                    "current_day_low": round(current_day_low, 2),
                    "strat_number_day": daily_data.get('strat_number'),
                    "strat_label_day": daily_data.get('strat_label'),
                    'is_green_day': daily_data.get('is_green'),
                    'is_red_day': daily_data.get('is_red'),
                    "inside_week": weekly_data.get('inside_bar'),
                    "outside_week": weekly_data.get('outside_bar'),
                    "strat_number_week": weekly_data.get('strat_number'),
                    "strat_label_week": weekly_data.get('strat_label'),
                    "is_green_week": weekly_data.get('is_green'),
                    "is_red_week": weekly_data.get('is_red'),
                    "weekly_close": round(weekly_close, 2),
                    "weekly_open": round(weekly_open, 2),
                    "previous_week_high": round(prev_week_high, 2),
                    "previous_week_low": round(prev_week_low, 2),
                    "current_week_high": round(current_week_high, 2),
                    "current_week_low": round(current_week_low, 2),
                }
                
                data.append(ticker_json)
    print('\nreturning reloaded data...', len(data), datetime.today(), '\n')
    with open('logs/wl/watchlist-{}.json'.format(start.strftime('%Y-%m-%d')), 'w') as f:
        json.dump(data, f)

    return jsonify({ "data": data })
@app.route("/scanner", methods=['GET'])
@cross_origin()
def saved_scanner():
    start, end = get_start_end_dates()
    with open('logs/wl/watchlist-{}.json'.format(start.strftime('%Y-%m-%d'))) as file:
        data = json.load(file)
    print('\nreturning saved data...', len(data), '\n')
    return jsonify({
        "data": data 
    })

def get_auth_field(field):
    with open('auth.json') as f:
        return json.load(f).get(field)

@app.route("/inside_days", methods=['GET'])
@cross_origin()
def inside_days():
    
    ticker_data = {}
    api_key = get_auth_field('IEX_API_KEY')
    tickers = 'AMD,PLTR,GM,FB,DIS,U,PENN'
    ticker_list = tickers.split(',')
    url = 'https://cloud.iexapis.com/stable/stock/market/chart/?token={}&range=1m&includeToday=true&symbols={}&format=json'.format(api_key, tickers)
    r = requests.get(url)
    inside_days = []
    records = r.json()

    for i in range(0, len(records)):
        record = records[i]
        ticker = record[0].get('symbol')
        ticker_data[ticker] = []
        for j in range(0, len(record)):
            prev_day_data = record[j - 1]
            daily_data = record[j]
            current_high = daily_data.get('fHigh')
            current_low = daily_data.get('fLow')
            prev_high = prev_day_data.get('high')
            prev_low = prev_day_data.get('low')
            inside_bar = False
            outside_bar = False
            is_green = False
            is_red = False
            if j > 0 and current_high and current_low and prev_high and prev_low:
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
                is_green = daily_data.get('fClose') > daily_data.get('fOpen')
                is_red = daily_data.get('fClose') < daily_data.get('fOpen')
            ticker_data[ticker].append({
                'date': daily_data.get('date'),
                'open': daily_data.get('fOpen'),
                'high': daily_data.get('fHigh'),
                'low': daily_data.get('fLow'),
                'close': daily_data.get('fClose'),
                'volume': daily_data.get('fVolume'),
                'symbol': daily_data.get('symbol'),
                'inside_bar': inside_bar,
                'outside_bar': outside_bar,
                'is_green': is_green,
                'is_red': is_red
            })


    return jsonify({
        "ticker_data": ticker_data 
    })

if __name__ == "__main__":
    app.run(debug=True)