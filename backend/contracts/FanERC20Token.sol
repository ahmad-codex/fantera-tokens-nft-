// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

abstract contract ERC20Interface {
    function transfer(address to, uint256 value)
        external
        virtual
        returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external virtual returns (bool);

    function balanceOf(address owner) external view virtual returns (uint256);

    function approve(address spender, uint256 value)
        external
        virtual
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        virtual
        returns (uint256);

    function totalSupply() external view virtual returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract FanERC20Token is ERC20Interface {
    string public name = "Fantera Token";
    string public symbol = "FAN";
    uint8 public decimals = 18;
    uint256 public _totalSupply = 1000000000 * (10**18);
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowed;

    constructor() {
        balances[msg.sender] = _totalSupply;
    }

    function transfer(address to, uint256 value)
        external
        override
        returns (bool)
    {
        require(balances[msg.sender] >= value, "token balance too low");
        balances[msg.sender] -= value;
        balances[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override returns (bool) {
        uint256 _allowance = allowed[from][msg.sender];
        require(_allowance >= value, "allowance too low");
        require(balances[from] >= value, "token balance too low");
        allowed[from][msg.sender] -= value;
        balances[from] -= value;
        balances[to] += value;
        emit Transfer(from, to, value);
        return true;
    }

    function approve(address spender, uint256 value)
        external
        override
        returns (bool)
    {
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function allowance(address owner, address spender)
        external
        view
        override
        returns (uint256)
    {
        return allowed[owner][spender];
    }

    function balanceOf(address owner) external view override returns (uint256) {
        return balances[owner];
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function faucet() external {
        _mint(msg.sender, 100 * (10**18));
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "mint to the zero address");

        _totalSupply += amount;
        balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
}
