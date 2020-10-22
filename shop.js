//Dependencies
let head = document.getElementsByTagName('head').item(0);
let script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', 'https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js');
head.appendChild(script);
script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', 'http://sdks.shopifycdn.com/js-buy-sdk/v2/latest/index.umd.min.js');
head.appendChild(script);

//Constants
const cartCookie = "cart"

class Shop {
    constructor(domain, storefrontToken) {
        let self = this
        this.shopifyClient = ShopifyBuy.buildClient({
            domain: domain,
            storefrontAccessToken: storefrontToken
        })
        this.initializeCartButton()
        let cart = Cookies.get(cartCookie)
        if (cart !== undefined) {
            this.cartContents = (JSON.parse(cart))
            this.refreshCartUi()
        } else {
            this.cartContents = {}
        }
        this.getProducts().then((products) => {
            self.products = products
        })
    }

    createCheckout(variantId) {
        this.shopifyClient.checkout.create().then((checkout) => {
            // Do something with the checkout
            this.checkout = checkout
            console.log("checkout created")
            console.log(checkout)
        });
    }

    getProducts() {
        return this.shopifyClient.product.fetchAll()
    }

    getProduct(id) {
        return client.product.fetch(productId)
    }

    addToCart(variantId) {
        if (!this.cartContents.hasOwnProperty(variantId)) {
            this.cartContents[variantId] = 0
        }
        this.cartContents[variantId]++
        this.saveCart()
    }

    updateQuantity(variantId, qty) {
        if (qty === 0) {
            delete this.cartContents[variantId]
        } else {
            this.cartContents[variantId] = qty
        }
        this.saveCart()
    }

    saveCart() {
        Cookies.set(cartCookie, JSON.stringify(this.cartContents), { expires: 7 })
        this.refreshCartUi()
    }

    refreshCartUi() {
        let cartButton = document.getElementById("cartbutton")
        if (Object.keys(this.cartContents).length > 0) {
            let cartQty = document.getElementById("cart-qty")
            cartQty.innerHTML = this.countCart()
            cartButton.removeAttribute('hidden')
        } else {
            cartButton.hidden = true
        }
    }

    getCartItemElement(variant, quantity) {
        let element = document.createElement("li")
        let image = document.createElement("img")
        image.src = variant.image.src
        element.appendChild(image)
        let label = document.createElement("text")
        label.innerHTML = this.getVariantTitle(variant.id)
        element.appendChild(label)
        let qty = document.createElement("text")
        qty.innerHTML = 'Quantity: ' + quantity
        element.appendChild(qty)
        let price = document.createElement("text")
        price.innerHTML = '$' + (variant.price * quantity).toFixed(2)
        element.appendChild(price)
        return element
    }

    countCart() {
        let i = 0
        for (const [key, value] of Object.entries(this.cartContents)) {
            console.log(`${key}: ${value}`);
            i += value
        }
        return i
    }

    initializeCartButton() {
        let self = this
        this.createModal()
        let modal = document.getElementById("cartmodal");
        let div = document.createElement('div');
        div.id = 'cartbutton';
        let btn = document.createElement('input');
        btn.type = 'image'
        btn.src = 'https://image.flaticon.com/icons/png/512/630/630746.png'
        btn.onclick = function() {
            self.buildCart()
            modal.style.display = "block";
        }
        window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = "none";
            }
        }
        let badge = document.createElement("span")
        badge.className = 'badge'
        badge.id = 'cart-qty'
        badge.innerHTML = 0
        div.appendChild(badge)
        div.appendChild(btn)
        div.hidden = true
        document.getElementsByTagName('body').item(0).appendChild(div);
    }

    createModal() {
        var self = this
        let modal = document.createElement('div')
        modal.id = 'cartmodal'
        modal.className = 'modal'
        let modalContent = document.createElement('div')
        modalContent.className = 'modal-content'
        modal.appendChild(modalContent)
        let cartView = document.createElement('ul')
        cartView.className = 'cart-view'
        cartView.id = 'cart-view'
        let ti = document.createElement('li')
        ti.innerHTML = 'ttttt'
        cartView.appendChild(ti)
        modalContent.append(cartView)
        let checkoutButton = document.createElement('input')
        checkoutButton.type = 'button'
        checkoutButton.value = 'Checkout'
        checkoutButton.className = "btn btn-success"
        checkoutButton.onclick = function(event) {
            self.doCheckout()
        }
        modalContent.appendChild(checkoutButton)
        document.getElementsByTagName('body').item(0).appendChild(modal);
    }

    doCheckout() {
        //TODO disable button
        let items = []
        for (const [key, value] of Object.entries(this.cartContents)) {
            items.push (
                {
                    variantId: key,
                    quantity: value
                }
            )
        }
        this.shopifyClient.checkout.create().then((checkout) => {
            console.log(checkout)
            this.shopifyClient.checkout.addLineItems(checkout.id, items).then((checkout) => {
                console.log(checkout);
                window.location.href = checkout.webUrl;
              });
          });
    }

    getVariant(variantId) {
        let v

        this.products.forEach((product) => {
            product.variants.forEach((variant) => {
                if (variant.id === variantId) {
                    v = variant
                }
            })
        })
        
        return v
    }

    getVariantTitle(variantId) {
        let v

        this.products.forEach((product) => {
            product.variants.forEach((variant) => {
                if (variant.id === variantId) {
                    v = product.title + ' ' + (variant.title === "Default Title" ? '' : variant.title)
                }
            })
        })
        
        return v
    }

    buildCart() {
        let cartView = document.getElementById('cart-view')
        while( cartView.firstChild ){
            cartView.removeChild( cartView.firstChild );
        }
        for (const [key, value] of Object.entries(this.cartContents)) {
            cartView.appendChild(this.getCartItemElement(this.getVariant(key), value))
        }
    }

}
