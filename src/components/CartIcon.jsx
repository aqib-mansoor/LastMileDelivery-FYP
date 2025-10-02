import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

function CartIcon() {
    const { cartCount } = useCart()
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/customer/cart')
    }

    return (
        <button
            onClick={handleClick}
            className="relative p-2 text-gray-600 hover:text-primary transition-colors"
            aria-label="Cart"
        >
            <ShoppingCartIcon className="h-6 w-6" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                </span>
            )}
        </button>
    )
}

export default CartIcon 