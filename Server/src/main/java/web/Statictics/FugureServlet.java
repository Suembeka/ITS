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
import statictics.Fugure;
import statictics.StaticticsService;

/**
 *
 * @author ksinn
 */
public class FugureServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        int id;
        long start;
        long end;
        long range;
        String type;
        String object;

        try {

            id = Integer.parseInt(request.getParameter("id"));
            start = Long.parseLong(request.getParameter("start"));
            end = Long.parseLong(request.getParameter("end"));
            range = 60000000;
            type = request.getParameter("type");
            object = request.getParameter("object");

            Fugure fugure = null;
            switch (object) {
                case "route": {
                    switch (type) {
                        case "money": {
                            fugure = StaticticsService.getRoute().getMoneyFugure(id, start, end, range);
                            break;
                        }
                        case "travels": {
                            fugure = StaticticsService.getRoute().getTravelsFugure(id, start, end, range);
                            break;
                        }
                        default: {
                            response.getWriter().print(Converter.toJSON("unknown fugure type"));
                        }
                    }
                    break;
                }
                default: {
                    response.getWriter().print(Converter.toJSON("unknown object type"));
                }
            }

            JSONObject stat = Converter.toJSON(fugure);
            response.getWriter().print(stat.toString());

        } catch (NumberFormatException ex) {
            response.getWriter().print(ex.getMessage()/*Converter.toJSON("error parameters")*/);
        } catch (SQLException|NamingException ex) {
            response.getWriter().print(ex.getMessage()/*Converter.toJSON("internal server error")*/);
        }

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
