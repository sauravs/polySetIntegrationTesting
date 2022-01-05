/*
    Copyright 2020 Set Labs Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    SPDX-License-Identifier: Apache License, Version 2.0
*/

pragma solidity 0.6.10;

import { AddressArrayUtils } from "../../lib/AddressArrayUtils.sol";
import { PreciseUnitMath } from "../../lib/PreciseUnitMath.sol";

interface IChainLinkOracle {
    function latestAnswer() external view returns (int256 answer);
}

contract ChainLinkAdapter{
    using PreciseUnitMath for int256;
    using AddressArrayUtils for address[];
    
    
    IChainLinkOracle public oracleAddress;
    bool public isAssetTwoUSD;
    string public oracleName;
    IChainLinkOracle public USDC_Oracle = IChainLinkOracle(0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6);
    
    
    constructor (IChainLinkOracle _chainLinkOracleAddress, string memory _name, bool _isAssetTwoUSD) public {
        oracleAddress = _chainLinkOracleAddress;
        oracleName = _name;
        isAssetTwoUSD = _isAssetTwoUSD;
    }
    
    function read() public view returns (int256){
        int256 price = oracleAddress.latestAnswer();
        int256 priceOfUSDC = USDC_Oracle.latestAnswer();
        if(isAssetTwoUSD){
            return price.preciseDiv(priceOfUSDC).preciseMul(10**6);
        } else {
            return price;
        }
    }
}