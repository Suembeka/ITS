/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package web.Entety;

import entity.Route;
import hibernate.Factory;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Collection;
import java.util.Iterator;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author ksinn
 */
public class RouteServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        JSONObject resp = new JSONObject();
        try {
            Collection<Route> routes = Factory.getInstance().getEntityDAO().getAll(Route.class);
            resp.put("status", "ok");
            resp.put("error", "");
            JSONArray data = new JSONArray();
            Iterator iterator = routes.iterator();
            while(iterator.hasNext()) {
                Route next = (Route) iterator.next();
                JSONObject point = new JSONObject();
                point.put("id", next.getId());
                point.put("name", next.getName());
                point.put("type", next.getType());
                data.put(point);
            }
            resp.put("data", data);
            
        } catch (SQLException ex) {
            resp.put("status", "error");
            resp.put("error", "internal server error");
        }
        response.getWriter().print(resp);

    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
