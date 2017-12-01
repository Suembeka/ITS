/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package statictics;

import hibernate.Factory;
import hibernate.RouteStaticticsDAO;

/**
 *
 * @author ksinn
 */
public class StaticticsService {
    

    public static RouteStaticticsDAO getRoute() {
        return Factory.getInstance().getRouteStaticticsDAO();
    }
    
}
