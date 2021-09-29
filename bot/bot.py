from twisted.internet import task, reactor
import requests
from datetime import datetime

timeout = 3600.0 # 1 hr

def fetch_watchlist():
    print('fetching watchlist...', datetime.today())    
    response = requests.get('http://localhost:5000/daily_scanner')
    print(response.json())

func_call = task.LoopingCall(fetch_watchlist)
func_call.start(timeout)
reactor.run()
