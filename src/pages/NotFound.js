import React from 'react'
import { Link } from 'react-router';


export default function NotFound() {
  return (
    <>
        <div className="page-slide">
            <div className="not-found d-flex justify-content-center align-items-center flex-column">

                
                <h2> sorry!!   </h2>
                <h3> We can't find the page you are looking for    </h3>
                <Link to="/" >
                 Back to Dashboard
              </Link>
            </div>

           
        </div>
    </>
  )
}
