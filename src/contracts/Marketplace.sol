pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint256 public shoeCount = 0;
    mapping(uint256 => Shoe) public shoes;
    struct Shoe {
        uint256 id;
        string name;
        uint256 price;
        address payable owner;
        bool purchased;
    }
    event ProductCreated(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );
    event ProductPurchased(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Shoe MarketPlace";
    }

    //create a shoe product
    function createProduct(string memory _name, uint256 _price) public {
        // valid name,price are required
        require(bytes(_name).length > 0);
        require(_price > 0);
        // increase shoe count
        shoeCount++;
        // add into shoes
        shoes[shoeCount] = Shoe(shoeCount, _name, _price, msg.sender, false);
        // trigger event
        emit ProductCreated(shoeCount, _name, _price, msg.sender, false);
    }

    //buy a pair of shoes
    function purchaseProduct(uint256 _id) public payable {
        // fetch shoe,owner
        Shoe memory _shoe = shoes[_id];
        address payable _seller = _shoe.owner;
        //ensure shoe is valid and buyer has enough ether to pay
        require(_shoe.id > 0 && _shoe.id <= shoeCount);
        require(msg.value >= _shoe.price);
        require(!_shoe.purchased);
        require(_seller != msg.sender);
        //purchase,which means transfer ownership to the buyer
        _shoe.owner = msg.sender;
        _shoe.purchased = true;
        //update shoe
        shoes[_id] = _shoe;
        //pay the seller by sending ether
        address(_seller).transfer(msg.value);
        //trigger an event
        emit ProductPurchased(
            shoeCount,
            _shoe.name,
            _shoe.price,
            msg.sender,
            true
        );
    }
}
