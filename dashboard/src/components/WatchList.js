import React, { useState, useEffect, useContext } from 'react';
import 'antd/dist/antd.css';
import { Modal, Layout, Button, Table, Input } from 'antd';
import axios from 'axios';
import TickerContext from '../context/ticker/tickerContext';

const WatchList = () => {
    const context = useContext(TickerContext);
    const { ticker, setTicker } = context;
    console.log({ticker})
    const [query, setQuery] = useState('');
    const { Sider } = Layout;
    const [watchList, setWatchList] = useState([]);
    const [tickers, setTickers] = useState(localStorage.getItem('tickers') || '')
    const [showTickerModal, setShowTickerModal] = useState(false);

    const fetchWatchList = async () => {
        const response = await axios.get(`http://localhost:5000/daily_scanner`, { params: { 'tickers': tickers } } )
        setWatchList(response.data.data);
    }

    const handleTickerChange = e => {
        setQuery(e.target.value.toUpperCase());
    }

    const addTicker = () => {
        setTicker(query);
        const newTickers = tickers + ' ' + query;
        localStorage.setItem('tickers', newTickers);
        const savedTickers = localStorage.getItem('tickers');
        setTickers(savedTickers);
        setQuery('');
    }
    
    const showRemoveTicker = (record, event) => {
        setTicker(record.ticker);
        setShowTickerModal(true);
    }

    const removeTicker = query => {
        let newTickers = tickers.replace(query).split(" ").filter(record => (record && record !== 'undefined') && record).join(" ");
        localStorage.setItem('tickers', newTickers);
        setTickers(newTickers);
        setQuery('')
        setShowTickerModal(false);
    }

    const columns = [
        {
          title: 'Symbol',
          dataIndex: 'ticker',
          key: 'ticker',
          render: text => <>{`$${text}`}</>
        },
        {
          title: 'Price',
          dataIndex: 'close',
          key: 'close',
          render: text => <>{`$${text}`}</>
        }
    ];

    useEffect(() => {
        fetchWatchList();
    }, [tickers])

    return (
        <Sider style={{ backgroundColor: '#fff'}} width={250} className="site-layout-background">
            <Modal
                visible={showTickerModal}
                onCancel={() => {
                    setShowTickerModal(false)
                    setTicker('')
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
                columns={columns}
                dataSource={watchList}
                pagination={false}
                onRow={(record) => {
                    return {
                      onClick: () => setTicker(record.ticker),
                      onDoubleClick: event => showRemoveTicker(record, event),
                    }}
                }
            />
        </Sider>
    )
}

export default WatchList;