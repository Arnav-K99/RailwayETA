from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import datetime

class DataSource(ABC):
    """
    Abstract Base Class for RailETA Data Ingestion.
    Decouples the ETA forecasting engine from specific telematics and telemetry providers.
    """
    
    @property
    @abstractmethod
    def source_type(self) -> str:
        """Name/Identifier of the data feed source."""
        pass

    @property
    @abstractmethod
    def is_live_railway(self) -> bool:
        """True if feeding from official Indian Railways APIs (FOIS/COA/NTES), False if simulation."""
        pass

    @abstractmethod
    def get_train_telemetry(self, train_id: str) -> Dict[str, Any]:
        """Fetch current GPS/telemetry position, speed, and status."""
        pass

    @abstractmethod
    def get_active_network_constraints(self, section_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch active caution orders, TSRs, and maintenance blocks."""
        pass

    @abstractmethod
    def get_weather_conditions(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch real-time or simulated meteorological conditions."""
        pass


class SimulationDataSource(DataSource):
    """
    Active DataSource for Smart India Hackathon prototype.
    Generates high-fidelity physics-based train motion, speed fluctuations, and synthetic telemetry.
    """
    
    @property
    def source_type(self) -> str:
        return "RailETA Synthetic Physics Engine (Simulation)"

    @property
    def is_live_railway(self) -> bool:
        return False

    def get_train_telemetry(self, train_id: str) -> Dict[str, Any]:
        return {
            "source": self.source_type,
            "connected": True,
            "status": "SIMULATED_FEED"
        }

    def get_active_network_constraints(self, section_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return []

    def get_weather_conditions(self, lat: float, lon: float) -> Dict[str, Any]:
        return {
            "condition": "Simulated Atmospheric Data",
            "weather_factor": 1.0,
            "precipitation_mm": 0.0
        }


class LiveRailwayDataSource(DataSource):
    """
    Production-ready architectural adapter for Ministry of Railways / CRIS feeds:
    - FOIS (Freight Operations Information System)
    - COA (Control Office Automation)
    - NTES (National Train Enquiry System)
    - RTIS (Real-Time Train Information System via ISRO NavIC satellite transponders)
    
    Currently dormant in SIH demonstration mode; fully specified for future deployment.
    """
    
    @property
    def source_type(self) -> str:
        return "CRIS / NTES / RTIS Satellite Feed"

    @property
    def is_live_railway(self) -> bool:
        return True

    def get_train_telemetry(self, train_id: str) -> Dict[str, Any]:
        raise NotImplementedError("Live CRIS / NTES feed adapter is configured for production deployment phase.")

    def get_active_network_constraints(self, section_id: Optional[str] = None) -> List[Dict[str, Any]]:
        raise NotImplementedError("Live Sectional Caution Order feed requires Indian Railways Division Control Office intranet.")

    def get_weather_conditions(self, lat: float, lon: float) -> Dict[str, Any]:
        raise NotImplementedError("IMD Doppler Radar integration scheduled for Phase 2.")
