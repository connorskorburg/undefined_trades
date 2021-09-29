import React, { useState, useEffect, useContext } from 'react';
import 'antd/dist/antd.css';
import { Modal, Layout, Button, Table, Input } from 'antd';
import axios from 'axios';
import TickerContext from '../context/ticker/tickerContext';

const WatchList = () => {
    const context = useContext(TickerContext);
    const { ticker } = context;
    const [query, setQuery] = useState('');
    const [didWatchlistChange,setDidWatchlistChange] = useState(false);
    const { Sider } = Layout;
    const [watchList, setWatchList] = useState([]);
    const [tickers, setTickers] = useState(localStorage.getItem('tickers') || '')
    const [showTickerModal, setShowTickerModal] = useState(false);

    const fetchWatchList = async () => {
        const response = await axios.get(`http://localhost:5000/daily_scanner`, { params: { 'tickers': tickers } } )
        setWatchList(response.data.data);
        setDidWatchlistChange(false);
    }

    const fetchSavedWatchList = async () => {
        const response = await axios.get(`http://localhost:5000/scanner`)
        console.log('loading saved watchlist...');
        setWatchList(response.data.data);
        setDidWatchlistChange(false);
    }

    const handleTickerChange = e => {
        setQuery(e.target.value.toUpperCase());
    }

    const addTicker = () => {
        const newTickers = tickers + ' ' + query;
        localStorage.setItem('tickers', newTickers);
        const savedTickers = localStorage.getItem('tickers');
        setTickers(savedTickers);
        setQuery('');
        setDidWatchlistChange(true);
    }
    
    const showRemoveTicker = (record, event) => {
        setQuery(record.ticker);
        setShowTickerModal(true);
    }

    const removeTicker = query => {
        let newTickers = tickers.replace(query).split(" ").filter(record => (record && record !== 'undefined' && !record.includes('undefined')) && record).join(" ");
        localStorage.setItem('tickers', newTickers);
        setTickers(newTickers);
        setQuery('')
        setShowTickerModal(false);
        setDidWatchlistChange(true);
    }

    const columns = [
        {
          title: 'Symbol',
          dataIndex: 'ticker',
          key: 'ticker',
          render: (text, record) => {
              return(
                <div  style={{ fontWeight: 'bold', textAlign: 'center', color: record.is_green_day ? 'green' : '#d12e49' }} >{`$${text}`}</div>
              ) 
            }
        },
        {
          title: 'Price',
          dataIndex: 'daily_close',
          key: 'daily_close',
          render: (text, record) => {
            return (
                <div  style={{ fontWeight: 'bold', textAlign: 'center', color: record.is_green_day ? 'green' : '#d12e49' }} >{`$${text}`}</div>
            )
          }
        },
        {
            title: 'Day',
            dataIndex: 'strat_label_day',
            key: 'strat_label_day',
            render: (strat_label, record) => {
                return (
                    <div style={{ fontWeight: 'bold', textAlign: 'center', color: record.is_green_day ? 'green' : '#d12e49' }}>{strat_label}</div>
                )
            }
        },
        {
            title: 'Week',
            dataIndex: 'strat_label_week',
            key: 'strat_label_week',
            render: (strat_label, record) => {
                return (
                    <div style={{ fontWeight: 'bold', textAlign: 'center', color: record.is_green_week ? 'green' : '#d12e49' }}>{strat_label}</div>
                )
            }
        }
    ];

    useEffect(() => {
        fetchSavedWatchList();
    }, [])

    useEffect(() => {
        if(didWatchlistChange === true) {
            console.log('watchlist reloading...')
            fetchWatchList();
        }
    }, [didWatchlistChange])

    return (
        <Sider style={{ margin:'2rem 0 2rem 2rem', height: '100%', backgroundColor: '#fff'}} width={400} className="site-layout-background">
            <Modal
                visible={showTickerModal}
                onCancel={() => {
                    setShowTickerModal(false)
                } }
                onOk={() => removeTicker(query)}
            >
                <p>{`Are you sure you want to remove $${ticker} from your watchlist?`}</p>
            </Modal>
            <div style={{ display: 'flex' }}>
                <Input type='text' value={query} onChange={(e) => handleTickerChange(e)} />
                <Button type='primary' onClick={() => addTicker()}>Add</Button>
            </div>
            <Table 
                scroll={{ y: 525 }}
                columns={columns}
                dataSource={watchList}
                pagination={false}
                onRow={(record) => {
                    return {
                      onDoubleClick: event => showRemoveTicker(record, event),
                    }}
                }
            />
        </Sider>
    )
}

export default WatchList;