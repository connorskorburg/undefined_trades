import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import { Layout, Button, Table, Input } from 'antd';
import axios from 'axios';

const WatchList = () => {
    const { Sider } = Layout;
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

    const [watchList, setWatchList] = useState([]);
    const [tickers, setTickers] = useState(localStorage.getItem('tickers') || '')
    const [ticker, setTicker] = useState('')

    const fetchWatchList = async () => {
        const response = await axios.get(`http://localhost:5000/daily_scanner`, { params: { 'tickers': tickers } } )
        setWatchList(response.data.data);
    }

    const handleTickerChange = e => {
        setTicker(e.target.value.toUpperCase());
    }

    const addTicker = () => {
        const newTickers = tickers + ' ' + ticker;
        localStorage.setItem('tickers', newTickers);
        const savedTickers = localStorage.getItem('tickers');
        setTickers(savedTickers);
        setTicker('');
    }

    useEffect(() => {
        fetchWatchList();
    }, [tickers])

    return (
        <Sider style={{ backgroundColor: '#fff'}} width={250} className="site-layout-background">
            <div style={{ display: 'flex' }}>
                <Input type='text' value={ticker} onChange={(e) => handleTickerChange(e)} />
                <Button type='primary' onClick={() => addTicker()}>Add</Button>
            </div>
            <Table columns={columns} dataSource={watchList} pagination={false} />
        </Sider>
    )
}

export default WatchList;