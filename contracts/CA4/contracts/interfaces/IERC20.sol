// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev ERC20代币接口
 */
interface IERC20 {
    /**
     * @dev 返回代币总供应量
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev 返回账户的代币余额
     * @param account 账户地址
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev 转移代币
     * @param to 接收地址
     * @param amount 转移金额
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev 返回所有者授权给spender的代币数量
     * @param owner 所有者地址
     * @param spender 被授权地址
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev 授权spender使用指定数量的代币
     * @param spender 被授权地址
     * @param amount 授权金额
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev 从from地址转移代币到to地址
     * @param from 发送地址
     * @param to 接收地址
     * @param amount 转移金额
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    /**
     * @dev 转移事件
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev 授权事件
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
} 