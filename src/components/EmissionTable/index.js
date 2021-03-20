import React, { Component } from 'react';
import EmissionChart from '../EmissionChart';
import { defaultEpochs } from './config'
export default class EmissionPanel extends Component {
  constructor(props) {
    super(props);
    /**
     * period = arbitrary number of blocks  
     * epoch = beginning of span of N periods w/some multiplier config
     * see ./config.js
     */ 
    this.state = {
      currentView: 'days',
      tokensPerBlock: 5,
      blocksPerPeriod: 43200, // day x 28 == 1 "month"
      communityFeePercent: 7.5,
      devFeePercent: 4.5,
      founderFeePercent: 3.0,
      startBlock: 0, // where first epoch starts
      startSupply: 0, // premined tokens
      epochConfigs: defaultEpochs,
      epochsData: [
        {
          startBlock: 0,
          endBlock: 0,
          startSupply: 0,
          endSupply: 0,
          multiplier: 0,
          totalMinted: 0,
          totalMintedCommunity: 0,
          totalMintedDevs: 0,
          totalMintedFounders: 0,
        },
      ],
      chartDataEpochs: [],
    }; 
    this.handleEpochChange = this.handleEpochChange.bind(this);
    this.handleTokensPerBlockChange = this.handleTokensPerBlockChange.bind(this);
    this.handleBlocksPerPeriodChange = this.handleBlocksPerPeriodChange.bind(this);
  }

  componentDidMount(prevProps) {
    this.rebuildEpochsData();
    this.rebuildChartData();
  }

  handleBlocksPerPeriodChange(e) {
    let newVal = e.target.value;
    if (newVal === '') {
      newVal = 1;
    }
    console.log('handleBlocksPerPeriodChange: ' + newVal)
    this.setState({ blocksPerPeriod: newVal }, () => { 
      this.rebuildEpochsList(e)
    })
  }

  handleTokensPerBlockChange(e) {
    let newVal = e.target.value;
    if (newVal === '') {
      newVal = 1;
    }
    console.log('handleTokensPerBlockChange: ' + newVal)
    this.setState({ tokensPerBlock: newVal }, () => { 
      this.rebuildEpochsList(e)
    })
  }

  // handle changes to epoch input
  handleEpochChange(e) {
    this.rebuildEpochData();  
  }

  rebuildEpochsList(e) {
    console.log(e)
    const [x, epoch, prop] = e.target.name.split("_")
    if (x !== 'x') {
      const { epochConfigs } = { ...this.state }
      const idx = (parseInt(epoch) - 1)
      epochConfigs[idx][prop] = e.target.value
      this.setState({ epochConfigs }, () => { 
        this.rebuildEpochsData();
      })
    } else {
      this.rebuildEpochsData();
    }
  }

  rebuildEpochsData() {
    const { epochConfigs, epochsData } = { ...this.state }
    console.log(epochConfigs)
    let prevEndSupply = this.state.startSupply
    let prevEndBlock = this.state.startBlock + (this.state.blocksPerPeriod * this.state.epochConfigs[0].periods)
    for (let i = 0, l = epochConfigs.length; i < l; ++i) {
      epochsData[i] = this.createDataForEpoch(i, prevEndSupply, prevEndBlock)
      prevEndBlock = epochsData[i].endBlock
      prevEndSupply = epochsData[i].endSupply
      console.log(epochsData);
    }
    this.setState({ epochsData: epochsData })
  }

  createDataForEpoch(n, prevEndSupply, prevEndBlock){
    let obj;
    console.log('createDataForEpoch: ' + n)
    if (n == 0) {
      const epochEndBlock = prevEndBlock;
      const epochRewardsMinted = this.state.tokensPerBlock * this.state.blocksPerPeriod * this.state.epochConfigs[n].periods * this.state.epochConfigs[n].mult
      const endSupply = this.state.startSupply + (this.state.tokensPerBlock * this.state.blocksPerPeriod * this.state.epochConfigs[n].periods * this.state.epochConfigs[n].mult)
      return {
        startSupply: this.state.startSupply,
        endSupply: endSupply,
        multiplier: this.state.epochConfigs[n].mult,
        startBlock: this.state.startBlock,
        endBlock: this.state.startBlock + (this.state.blocksPerPeriod * this.state.epochConfigs[n].periods),
        bonusMultiplier: this.state.epochConfigs[n].mult,
        totalMinted: epochRewardsMinted,
        totalMintedCommunity: endSupply * (this.state.communityFeePercent / 100),
        totalMintedDevs: endSupply * (this.state.devFeePercent / 100),
        totalMintedFounders: endSupply * (this.state.founderFeePercent / 100),
      }
    } else {
      console.log(this.state.epochsData)
      const epochEndBlock = prevEndBlock + (this.state.blocksPerPeriod * this.state.epochConfigs[n].periods);
      const epochRewardsMinted = this.state.tokensPerBlock * this.state.blocksPerPeriod * this.state.epochConfigs[n].periods * this.state.epochConfigs[n].mult
      const endSupply = prevEndSupply + (this.state.tokensPerBlock * this.state.blocksPerPeriod * this.state.epochConfigs[n].periods * this.state.epochConfigs[n].mult)
      return {
        startSupply: prevEndSupply,
        endSupply: endSupply,
        multiplier: this.state.epochConfigs[n].mult,
        startBlock: prevEndBlock++,
        endBlock: prevEndBlock++ + (this.state.blocksPerPeriod * this.state.epochConfigs[n].periods),
        bonusMultiplier: this.state.epochConfigs[n].mult,
        totalMinted: epochRewardsMinted,
        totalMintedCommunity: endSupply * (this.state.communityFeePercent / 100),
        totalMintedDevs: endSupply * (this.state.devFeePercent / 100),
        totalMintedFounders: endSupply * (this.state.founderFeePercent / 100),
      }
    }
  }

  rebuildChartData() {
    let chartDataEpochs = [], chartDataPeriods = [];
    for (let i = 0, l = this.state.epochConfigs.length; i < l; ++i) {
      chartDataEpochs[i] = {
        epoch: i,
        vol: this.state.epochsData[i].totalMinted,
        supply: this.state.epochsData[i].endSupply
      }
    }
    this.setState({
      chartData: chartDataEpochs,
    });
  }

  render() {
    return (
      <div className="w-full">
        <div className="w-full flex flex-wrap mx-auto p-auto text-2xl bg-gray-100">
          <div className="text-4xl p-8 m-8 text-purple-600"> MochiSwap Tokenomics Modeling Tool </div>
        </div>
        <div className="w-5/6 flex flex-wrap content-start mx-auto my-4 border-4 border-light-blue-500 border-opacity-50">
          <div className="w-full bg-pink-600 px-6 border-4 border-gray-300 border-opacity-90">
            <div className="my-4">
              <label className="text-lg text-white">
                Tokens per block
              <input className="border py-1 pl-3 text-black ml-3" name="x_0_tpb" type="text" size="3" value={this.state.tokensPerBlock} onChange={this.handleTokensPerBlockChange.bind(this)} />
              </label>
            </div>
            <div className="my-4">
              <label className="text-lg text-white">
                Blocks per day
              <input className="border py-1 pl-3 ml-3 text-black" name="x_0_bpp" type="text" size="10" value={this.state.blocksPerPeriod} onChange={this.handleBlocksPerPeriodChange} /> ({this.state.blocksPerPeriod} per month)
              </label>
            </div>
          </div>
        </div>

        <div className="w-5/6 flex flex-wrap content-center mx-auto my-4 text-lg text-white">

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-pink-700 border-opacity-90">
            <div className="my-4 bg-red">
              <label>
                STAGE 1 MULTIPLIER
                <input className="border py-1 pl-3 ml-3 text-black" name="e_1_mult" type="text" size="3" value={this.state.epochConfigs[0].mult} onChange={this.handleEpochChange} /> x
              </label>
            </div>
            <div className="my-4 bg-red">
              <label className="">
                STAGE 1 PERIODS
                <input className="border py-1 pl-3 ml-3 text-black" name="e_1_periods" type="text" size="3" value={this.state.epochConfigs[0].periods} onChange={this.handleEpochChange} />
              </label>
            </div>
          </div>

          <div className="w-1/6  bg-pink-600 px-6 border-4 border-gray-300 border-opacity-90">
            <div className="my-4 bg-red">
              <label className="">
                STAGE 2 BONUS
                <input className="border py-1 pl-3 ml-3 text-black" name="e_2_mult" type="text" size="3" value={this.state.epochConfigs[1].mult} onChange={this.handleEpochChange} /> x
              </label>
            </div>
            <div className="my-4 bg-red">
              <label className="">
                STAGE 2 LENGTH
                <input className="border py-1 pl-3 ml-3 text-black" name="e_2_periods" type="text" size="3" value={this.state.epochConfigs[1].periods} onChange={this.handleEpochChange} />
              </label>
            </div>
          </div>
          <div className="w-1/6 bg-pink-600 px-6 border-4 border-gray-300 border-opacity-90">
            <div className="my-4 bg-red">
              <label className="">
                STAGE 3 BONUS
                <input className="border py-1 pl-3 ml-3 text-black" name="e_3_mult" type="text" size="3" value={this.state.epochConfigs[2].mult} onChange={this.handleEpochChange} /> x 
              </label>
            </div>
            <div className="my-4 bg-red ">
              <label className="">
                STAGE 3 LENGTH
                <input className="border py-1 pl-3 ml-3 text-black" name="e_3_periods" type="text" size="3" value={this.state.epochConfigs[2].periods} onChange={this.handleEpochChange} />
              </label>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-gray-300 border-opacity-90">
            <div className="my-4 bg-red">
              <label className="">
                STAGE 4 BONUS
                <input className="border py-1 pl-3 ml-3 text-black" name="e_4_mult" type="text" size="3" value={this.state.epochConfigs[3].mult} onChange={this.handleEpochChange} /> x 
              </label>
            </div>
            <div className="my-4 bg-red">
              <label className="">
                STAGE 4 LENGTH
                <input className="border py-1 pl-3 ml-3 text-black" name="e_4_periods" type="text" size="3" value={this.state.epochConfigs[3].periods} onChange={this.handleEpochChange} />
              </label>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-gray-300 border-opacity-90">
            <div className="my-4 bg-red">
              <label className="">
                STAGE 5 BONUS
                <input className="border py-1 pl-3 ml-3 text-black" name="e_5_mult" type="text" size="3" value={this.state.epochConfigs[4].mult} onChange={this.handleEpochChange} /> x 
              </label>
            </div>
            <div className="my-4 bg-red">
              <label className="">
                STAGE 5 LENGTH
                <input className="border py-1 pl-3 ml-3 text-black" name="e_5_periods" type="text" size="3" value={this.state.epochConfigs[4].periods} onChange={this.handleEpochChange} />
              </label>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-gray-300 border-opacity-90">
            <div className="my-4 bg-red">
              <label className="">
                STAGE 6 BONUS
                <input className="border py-1 pl-3 ml-3 text-black" name="e_5_mult" type="text" size="3" value={this.state.epochConfigs[5].mult} onChange={this.handleEpochChange} /> x 
              </label>
            </div>
            <div className="my-4 bg-red">
              <label className="">
                STAGE 6 LENGTH
                <input className="border py-1 pl-3 ml-3 text-black" name="e_5_periods" type="text" size="3" value={this.state.epochConfigs[5].periods} onChange={this.handleEpochChange} />
              </label>
            </div>
          </div>  
        </div>

        <EmissionChart chartData={this.state.chartData} />
        <hr />
        
        <p className="text-lg text-center font-bold m-5 mx-auto">Emission over first 6 months @ {this.state.tokensPerBlock} tokens per block - 6 bonus stages w/3 funds</p>
        <table className="rounded-t-lg m-5 w-5/6 mx-auto text-pink-100 bg-pink-700">
          <thead>
            <tr className="text-left border-b-2 border-pink-200 font-bold">
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Start Block</th>
              <th className="px-4 py-3">End Block</th>
              <th className="px-4 py-3">Bonus Multiplier</th>
              <th className="px-4 py-3">Period Emission</th>
              <th className="px-4 py-3">Cumulative Total</th>
              <th className="px-4 py-3">Community Fund</th>
              <th className="px-4 py-3">Dev Vault</th>
              <th className="px-4 py-3">Founder Vault</th>
            </tr>
          </thead>
          <tbody>
          { this.state.epochsData.map((epoch) => ( 
            <tr className="bg-pink-600 font-semibold">
              <td className="px-4 py-3 border-b border-pink-500">{epoch.periods}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.startBlock}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.endBlock}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.multiplier}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMinted}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.endSupply}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMintedCommunity}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMintedDevs}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMintedFounders}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    )
  }
}