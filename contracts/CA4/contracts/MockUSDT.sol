// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT - 模拟USDT代币合约（用于测试）
 * @dev 实现ERC20标准，用于测试RecipeMarketplace合约
 * @dev 修改：所有用户都可以铸造和销毁代币
 * @author Bars Help Bars Team
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals = 6; // USDT使用6位小数

    /**
     * @dev 构造函数
     * @param name 代币名称
     * @param symbol 代币符号
     */
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) 
        Ownable(msg.sender) 
    {}

    /**
     * @dev 返回代币小数位数
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev 铸造代币（所有用户都可以调用）
     * @param to 接收地址
     * @param amount 铸造金额
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev 销毁代币（所有用户都可以调用）
     * @param from 销毁地址
     * @param amount 销毁金额
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
} 