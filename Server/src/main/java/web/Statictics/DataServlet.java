/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package web.Statictics;

import java.io.IOException;
import java.sql.SQLException;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import statictics.Converter;
import statictics.Statictics;
import statictics.StaticticsService;

/**
 *
 * @author ksinn
 */
public class DataServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        int id;
        long start;
        long end;
        String object;

        try {

            try {
            id = Integer.parseInt(request.getParameter("id"));
            object = request.getParameter("object");
            } catch (Exception ex) {
                id = 0;
                object = "route";
                
            }
            try {
                start = Long.parseLong(request.getParameter("start"));
                end = Long.parseLong(request.getParameter("end"));
            } catch (Exception ex) {
                start = 1; end = System.currentTimeMillis();
            }
           

            Statictics statistics = null;
            switch (object) {
                case "route": {
                    statistics = StaticticsService.getRoute().getDate(id, start, end);
                    break;
                }
                default: {
                    response.getWriter().print(Converter.toJSON("unknown object type"));
                }
            }

            JSONObject stat = Converter.toJSON(statistics);
            response.getWriter().print(stat.toString());

        } catch (NumberFormatException ex) {
            //response.getWriter().print(Converter.toJSON("error parameters"));
            response.getWriter().print(ex.getLocalizedMessage());
        } catch (SQLException | NamingException ex) {
            response.getWriter().print(Converter.toJSON("internal server error"));
            response.getWriter().print(ex.getLocalizedMessage());
        }

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
