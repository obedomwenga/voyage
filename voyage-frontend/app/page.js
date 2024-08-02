import LandingNavbar from "../components/Landingpage/LandingNavBar"
import LandingPage from "../components/Landingpage/LandingPage"
import InfoSection from "../components/Landingpage/InfoSection"
import Footer from "../components/Landingpage/Footer"

const Home = () => {
    return (
        <div>
            <LandingNavbar />
            <LandingPage />
            <InfoSection />
            <Footer />
        </div>
    )
}

export default Home
