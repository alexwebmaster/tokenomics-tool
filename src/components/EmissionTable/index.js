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
      tokensPerBlock: 0.9,
      blocksPerPeriod: 43200, // 1 day
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
          grandTotalSupply: 0
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
        idx: n,
        startSupply: this.state.startSupply,
        endSupply: endSupply,
        multiplier: this.state.epochConfigs[n].mult,
        periods: this.state.epochConfigs[n].periods,
        startBlock: this.state.startBlock,
        endBlock: this.state.startBlock + (this.state.blocksPerPeriod * this.state.epochConfigs[n].periods),
        bonusMultiplier: this.state.epochConfigs[n].mult,
        totalMinted: epochRewardsMinted,
        totalMintedCommunity: endSupply * (this.state.communityFeePercent / 100),
        totalMintedDevs: endSupply * (this.state.devFeePercent / 100),
        totalMintedFounders: endSupply * (this.state.founderFeePercent / 100),
        grandTotalSupply: endSupply + (endSupply * (this.state.communityFeePercent / 100)) + (endSupply * (this.state.devFeePercent / 100)) + (endSupply * (this.state.founderFeePercent / 100))
      }
    } else {
      console.log(this.state.epochsData)
      const epochEndBlock = prevEndBlock + (this.state.blocksPerPeriod * this.state.epochConfigs[n].periods);
      const epochRewardsMinted = this.state.tokensPerBlock * this.state.blocksPerPeriod * this.state.epochConfigs[n].periods * this.state.epochConfigs[n].mult
      const endSupply = prevEndSupply + (this.state.tokensPerBlock * this.state.blocksPerPeriod * this.state.epochConfigs[n].periods * this.state.epochConfigs[n].mult)
      return {
        idx: n,
        startSupply: prevEndSupply,
        endSupply: endSupply,
        multiplier: this.state.epochConfigs[n].mult,
        periods: this.state.epochConfigs[n].periods,
        startBlock: prevEndBlock++,
        endBlock: prevEndBlock++ + (this.state.blocksPerPeriod * this.state.epochConfigs[n].periods),
        bonusMultiplier: this.state.epochConfigs[n].mult,
        totalMinted: epochRewardsMinted,
        totalMintedCommunity: endSupply * (this.state.communityFeePercent / 100),
        totalMintedDevs: endSupply * (this.state.devFeePercent / 100),
        totalMintedFounders: endSupply * (this.state.founderFeePercent / 100),
        grandTotalSupply: endSupply + (endSupply * (this.state.communityFeePercent / 100)) + (endSupply * (this.state.devFeePercent / 100)) + (endSupply * (this.state.founderFeePercent / 100))
      }
    }
  }

  rebuildChartData() {
    let chartDataEpochs = [], chartDataPeriods = [];
    for (let i = 0, l = this.state.epochConfigs.length; i < l; ++i) {
      chartDataEpochs[i] = {
        epoch: i,
        vol: this.state.epochsData[i].totalMinted,
        supply: this.state.epochsData[i].startSupply
      }
    }
    this.setState({
      chartData: chartDataEpochs,
    });
  }
 
  render() {
    return (

      <div className="w-full">
        
        <div className="w-5/6 flex flex-wrap content-center mx-auto my-4 text-xs text-white bg-gray-800 shadow-lg">
          <div className="text-4xl p-8 m-8 text-white"> MochiSwap Tokenomics Modeling Tool </div>
        </div>

        <div className="w-5/6 flex flex-wrap content-center mx-auto my-4 text-xs text-white bg-aqua-800">
          
          <div className="w-1/6 border-4 border-r-0 border-gray-300 border-opacity-60">
            <div className="w-full p-6">
              <div className="">
                <label className="">
                  BASE TOKENS PER BLOCK
                <input className="py-1 pl-3 text-black ml-3" name="x_0_tpb" type="text" size="3" value={this.state.tokensPerBlock} onChange={this.handleTokensPerBlockChange.bind(this)} />
                </label>
              </div>
            </div>
          </div>
          
          <div className="w-1/6 border-4 border-r-0 border-gray-300 border-opacity-60">  
            <div className="w-full p-6">
              <div className="">
                <label className="">
                  BLOCKS PER PERIOD
                <input className="border py-1 pl-3 ml-3 text-black" name="x_0_bpp" type="text" size="6" value={this.state.blocksPerPeriod} onChange={this.handleBlocksPerPeriodChange} /> 
                </label>
              </div>
              </div>
          </div>
          
          <div className="w-1/6 border-4 border-r-0 border-gray-300 border-opacity-60">  
            <div className="w-full p-6">
              <div className="">
                <label className="">
                  COMMUNITY REWARD 
                  <input className="border py-1 pl-3 text-black ml-3" name="x_0_com" type="text" size="2" value={this.state.communityFeePercent}  /> %
                </label>
              </div>
              </div>
          </div>
          
          <div className="w-1/6 border-4 border-r-0 border-gray-300 border-opacity-60">  
            <div className="w-full p-6">
              <div className="">
                <label className="">
                  DEVELOPER REWARD
                <input className="border py-1 pl-3 ml-3 text-black" name="x_0_dev" type="text" size="2" value={this.state.devFeePercent} /> %
                </label>
              </div>
            </div>
          </div>

          <div className="w-1/6 border-4 border-r-0 border-gray-300 border-opacity-60">  
            <div className="w-full p-6">
              <div className="">
                <label className="">
                FOUNDERS REWARD
                <input className="border py-1 pl-3 ml-3 text-black" name="x_0_founder" type="text" size="2" value={this.state.founderFeePercent} /> %
                </label>
              </div>
            </div>
          </div>
          
          <div className="w-1/6 border-4 border-l-0 border-gray-300 border-opacity-60">  
            <div className="w-full p-6">
              <div className="pt-1">
                <label className="">
                TOTAL REWARD <span className="font-bold"> {this.state.founderFeePercent + this.state.communityFeePercent + this.state.devFeePercent}%</span>
                </label>
              </div>
            </div>
          </div>
          
        </div>

        <div className="w-5/6 flex flex-wrap content-center mx-auto my-4 text-xs text-white">
         
          <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
            
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_1_mult">
                  STAGE 1 MULTIPLIER
                </label>
              </div>
              <div className="w-1/4">
                <input className="py-1 pl-3 text-black" id="e_1_mult" name="e_1_mult" type="text" size="3" value={this.state.epochConfigs[0].mult} onChange={this.handleEpochChange} /> x
              </div>
            </div>

            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_1_periods">
                  STAGE 1 LENGTH 
                </label>
              </div>
              <div className="w-1/4">
                <input className="border-r-0 py-1 pl-3 text-black" name="e_1_periods" type="text" size="3" value={this.state.epochConfigs[0].periods} onChange={this.handleEpochChange} />
              </div>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_2_mult">
                  STAGE 2 MULTIPLIER
                </label>
              </div>
              <div className="w-1/4">
                <input className="py-1 pl-3 text-black" name="e_2_mult" type="text" size="3" value={this.state.epochConfigs[1].mult} onChange={this.handleEpochChange} /> x
              </div>
            </div>
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_2_periods">
                  STAGE 2 LENGTH
                </label>
              </div>
              <div className="w-1/4">
                <input className="py-1 pl-3 text-black" name="e_2_periods" type="text" size="3" value={this.state.epochConfigs[1].periods} onChange={this.handleEpochChange} />
              </div>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_3_mult">
                  STAGE 3 MULTIPLIER
                </label>
                </div>
                <div className="w-1/4">
                  <input className="border py-1 pl-3 text-black" name="e_3_mult" type="text" size="3" value={this.state.epochConfigs[2].mult} onChange={this.handleEpochChange} /> x 
                </div>
            </div>
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_3_periods">
                  STAGE 3 LENGTH
                </label>
              </div>
              <div className="w-1/4">
                <input className="border py-1 pl-3 text-black" name="e_3_periods" type="text" size="3" value={this.state.epochConfigs[2].periods} onChange={this.handleEpochChange} />
              </div>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_4_mult">
                  STAGE 4 MULTIPLIER
                </label>
              </div>
              <div className="w-1/4">
                <input className="border py-1 pl-3 text-black" name="e_4_mult" type="text" size="3" value={this.state.epochConfigs[3].mult} onChange={this.handleEpochChange} /> x 
              </div>
            </div>

            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_4_periods">
                  STAGE 4 LENGTH
                </label>
              </div>
              <div className="w-1/4">
                <input className="border py-1 pl-3 border-r-0 text-black" name="e_4_periods" type="text" size="3" value={this.state.epochConfigs[3].periods} onChange={this.handleEpochChange} />
              </div>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_5_mult">
                  STAGE 5 MULTIPLIER
                </label>
              </div>
              <div className="w-1/4">
                <input className="py-1 pl-3 text-black" name="e_5_mult" type="text" size="3" value={this.state.epochConfigs[4].mult} onChange={this.handleEpochChange} /> x 
              </div>
            </div>

            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_5_periods">
                  STAGE 5 LENGTH
                </label>
              </div>
              <div className="w-1/4">
                <input className="py-1 pl-3 text-black" name="e_5_periods" type="text" size="3" value={this.state.epochConfigs[4].periods} onChange={this.handleEpochChange} />
              </div>
            </div>
          </div>

          <div className="w-1/6 bg-pink-600 px-6 border-4 border-gray-300 border-opacity-60">
            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_6_mult">
                  STAGE 6 MULTIPLIER
                </label>
              </div>
              <div className="w-1/4">
                <input className="py-1 pl-3 text-black" name="e_6_mult" type="text" size="3" value={this.state.epochConfigs[5].mult} onChange={this.handleEpochChange} /> x 
              </div>
            </div>

            <div className="my-4 flex flex-row">
              <div className="w-3/4">
                <label for="e_6_periods">
                  STAGE 6 LENGTH
                </label>
                </div>
                <div className="w-1/4">
                <input className="border py-1 pl-3 text-black" name="e_6_periods" type="text" size="3" value={this.state.epochConfigs[5].periods} onChange={this.handleEpochChange} />
              </div>
            </div>
          </div>  
        </div>

        <div className="w-5/6 flex flex-wrap content-center mx-auto my-4 text-xs text-white">
         
         <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
           
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_1_mult">
                 STAGE 7 MULTIPLIER
               </label>
             </div>
             <div className="w-1/4">
               <input className="py-1 pl-3 text-black" id="e_1_mult" name="e_1_mult" type="text" size="3" value={this.state.epochConfigs[6].mult} onChange={this.handleEpochChange} /> x
             </div>
           </div>

           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_1_periods">
                 STAGE 7 LENGTH 
               </label>
             </div>
             <div className="w-1/4">
               <input className="border-r-0 py-1 pl-3 text-black" name="e_1_periods" type="text" size="3" value={this.state.epochConfigs[6].periods} onChange={this.handleEpochChange} />
             </div>
           </div>
         </div>

         <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_2_mult">
                 STAGE 8 MULTIPLIER
               </label>
             </div>
             <div className="w-1/4">
               <input className="py-1 pl-3 text-black" name="e_2_mult" type="text" size="3" value={this.state.epochConfigs[7].mult} onChange={this.handleEpochChange} /> x
             </div>
           </div>
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_2_periods">
                 STAGE 8 LENGTH
               </label>
             </div>
             <div className="w-1/4">
               <input className="py-1 pl-3 text-black" name="e_2_periods" type="text" size="3" value={this.state.epochConfigs[7].periods} onChange={this.handleEpochChange} />
             </div>
           </div>
         </div>

         <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_3_mult">
                 STAGE 9 MULTIPLIER
               </label>
               </div>
               <div className="w-1/4">
                 <input className="border py-1 pl-3 text-black" name="e_3_mult" type="text" size="3" value={this.state.epochConfigs[8].mult} onChange={this.handleEpochChange} /> x 
               </div>
           </div>
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_3_periods">
                 STAGE 9 LENGTH
               </label>
             </div>
             <div className="w-1/4">
               <input className="border py-1 pl-3 text-black" name="e_3_periods" type="text" size="3" value={this.state.epochConfigs[8].periods} onChange={this.handleEpochChange} />
             </div>
           </div>
         </div>

         <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_4_mult">
                 STAGE 10 MULTIPLIER
               </label>
             </div>
             <div className="w-1/4">
               <input className="border py-1 pl-3 text-black" name="e_4_mult" type="text" size="3" value={this.state.epochConfigs[9].mult} onChange={this.handleEpochChange} /> x 
             </div>
           </div>

           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_4_periods">
                 STAGE 10 LENGTH
               </label>
             </div>
             <div className="w-1/4">
               <input className="border py-1 pl-3 border-r-0 text-black" name="e_4_periods" type="text" size="3" value={this.state.epochConfigs[9].periods} onChange={this.handleEpochChange} />
             </div>
           </div>
         </div>

         <div className="w-1/6 bg-pink-600 px-6 border-4 border-r-0 border-gray-300 border-opacity-60">
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_5_mult">
                 STAGE 11 MULTIPLIER
               </label>
             </div>
             <div className="w-1/4">
               <input className="py-1 pl-3 text-black" name="e_5_mult" type="text" size="3" value={this.state.epochConfigs[10].mult} onChange={this.handleEpochChange} /> x 
             </div>
           </div>

           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_5_periods">
                 STAGE 11 LENGTH
               </label>
             </div>
             <div className="w-1/4">
               <input className="py-1 pl-3 text-black" name="e_5_periods" type="text" size="3" value={this.state.epochConfigs[10].periods} onChange={this.handleEpochChange} />
             </div>
           </div>
         </div>

         <div className="w-1/6 bg-pink-600 px-6 border-4 border-gray-300 border-opacity-60">
           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_6_mult">
                 STAGE 12 MULTIPLIER
               </label>
             </div>
             <div className="w-1/4">
               <input className="py-1 pl-3 text-black" name="e_6_mult" type="text" size="3" value={this.state.epochConfigs[11].mult} onChange={this.handleEpochChange} /> x 
             </div>
           </div>

           <div className="my-4 flex flex-row">
             <div className="w-3/4">
               <label for="e_6_periods">
                 STAGE 12 LENGTH
               </label>
               </div>
               <div className="w-1/4">
               <input className="border py-1 pl-3 text-black" name="e_6_periods" type="text" size="3" value={this.state.epochConfigs[11].periods} onChange={this.handleEpochChange} />
             </div>
           </div>
         </div>  
       </div>

        <EmissionChart chartData={this.state.chartData} />
        <hr />
        
        <p className="text-lg text-center font-bold m-5 mx-auto">Emission over first {this.state.epochConfigs.length / 2} months @ {this.state.tokensPerBlock} tokens per block - 12 bonus stages w/3 funds</p>
        <table className="rounded-t-lg m-5 w-5/6 mx-auto text-pink-100 bg-pink-700">
          <thead>
            <tr className="text-left border-b-2 border-pink-200 font-bold">
            <th className="px-4 py-3">Epoch </th>
              <th className="px-4 py-3">Num Days</th>
              <th className="px-4 py-3">Start Block</th>
              <th className="px-4 py-3">End Block</th>
              <th className="px-4 py-3">Bonus Multiplier</th>
              <th className="px-4 py-3">Period Emission</th>
              <th className="px-4 py-3">Cumulative Rewards</th>
              <th className="px-4 py-3">Community Fund</th>
              <th className="px-4 py-3">Dev Vault</th>
              <th className="px-4 py-3">Founder Vault</th>
              <th className="px-4 py-3">Total Supply</th>
            </tr>
          </thead>
          <tbody>
          { this.state.epochsData.map((epoch) => ( 
            <tr className="bg-pink-600 font-semibold">
              <td className="px-4 py-3 border-b border-pink-500">{epoch.idx}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.periods}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.startBlock}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.endBlock}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.multiplier}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMinted}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.endSupply}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMintedCommunity}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMintedDevs}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.totalMintedFounders}</td>
              <td className="px-4 py-3 border-b border-pink-500">{epoch.grandTotalSupply}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    )
  }
}