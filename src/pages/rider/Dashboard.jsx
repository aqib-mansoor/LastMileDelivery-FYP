import { useState, useEffect } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { apiRequest } from '../../api/authService'

function Dashboard() {
  return (
    <Navigate to="/rider/ready-orders" />
  )
}

export default Dashboard
